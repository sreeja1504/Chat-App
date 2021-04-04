const path = require('path'); //core library no need to install 
const http = require('http');  //core library
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js');
const e = require('express');


const app = express();
const server = http.createServer(app); //create new web server and pass express application to it 
const io = socketio(server); // server supporting socket 

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
//as new web server created instead of calling app.listen call server.listen to start up http server
// app.listen(port,()=>{
//     console.log('server is set on port '+port);
// })


//listening for the event to occur .we provide first arg as event and second arg           as function to run when that event occurs
//server(emit)->client(receive) - countUpdated
//client(emit)->server(receive) - increment


// let count = 0;
io.on('connection', (socket) => {
    console.log('New websocket connection');
    // socket.emit('message','Welcome!')
    // socket.emit('message',{
    //     text :'welcome',
    //     createdAt : new Date().getTime()
    // })

    // socket.emit('message', generateMessage('Welcome!'))
    // socket.broadcast.emit('message',generateMessage('A new user har joined'));  //send message to all others except current socket

    // socket.on('join',({username , room},callback)=>{
    //     const {error,user} = addUser({id : socket.id ,username ,room})
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options})

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`));
        //send message to all others except current socket in the room 
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
    })

    //without acknowledgement to be sent
    // socket.on('sendMessage',(message)=>{
    //     io.emit('message',message);
    //   })
    //with acknowledgement to be sent
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        const user = getUser(socket.id);
        // io.emit('message',message);
        // io.emit('message',generateMessage(message));
        io.to(user.room).emit('message', generateMessage(user.username,message));

        callback();
    })


    //without acknowledgement to be sent
    // socket.on('sendLocation',(coords)=>{
    //     io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
    // })
    //with acknowledgement to be sent
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        // io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

        callback();
    })



    socket.on('disconnect', (message) => {
       const user = removeUser(socket.id)

        //this can be used it works ..but that user already left so y to use socket.broadcast.emit instead can use io.emit where for all remaining users msg can be sent 

        // socket.broadcast.emit('message','A user has left'); 
        // io.emit('message','A user has left');
        if(user){
        io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`));
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        }
    })

    // socket.emit('countUpdated', count);
    // socket.on('increment',()=>{
    //     count++;
    //     // socket.emit('countUpdated',count); //send data only for 1 specific client
    //     io.emit('countUpdated',count); //send for all the clients of server
    // })
})
server.listen(port, () => {
    console.log('server is set on port ' + port);
})