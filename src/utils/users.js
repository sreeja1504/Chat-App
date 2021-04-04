const users = []
//addUser ,removeUser,getUser ,getUsersInRoom

const addUser = ({ id, username, room }) => {
    //clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    //validate the data
    if (!username || !room) {
        return {
            error: "username and room are required"
        }
    }
    //check for existing user 
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    //validate username 
    if(existingUser){
        return {
            error : "UserName is in use!"
        }
    }
    //store user
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
//    const index = users.findIndex((user) =>{
//      return user.id === id
//    })

   const index = users.findIndex((user) => user.id === id)
   if(index !== -1){
     return users.splice(index,1)[0]; //splice removes no of elements from given index
     //users.splice(index,1)[0] return deleted user details 
   }

}

const getUser = (id) =>{
    return users.find((user)=> user.id === id )
}

const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase();
   return  users.filter((user)=> user.room === room)
}


// addUser({
//     id : 22,
//     username : 'sree',
//     room : 'south philly'
// })

// addUser({
//     id : 24,
//     username : 'mike',
//     room : 'south philly'
// })

// addUser({
//     id : 25,
//     username : 'andrew',
//     room : 'center city'
// })


console.log(users);

// const res = addUser({
//     id : 23,
//     username : 'Sree',
//     room : 'south philly'
// })
// console.log(res);
// console.log(users);
// const removedUser = removeUser(22);
// console.log(removedUser);
// console.log(users);

// console.log(getUser(22));

//  console.log(getUsersInRoom(`south philly`));

 module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
 }