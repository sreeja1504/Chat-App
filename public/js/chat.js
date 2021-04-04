const socket = io()
// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated !',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked');
//     socket.emit('increment');
// })



//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $messages = document.querySelector('#messages');


//templates 
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const {username , room} = Qs.parse(location.search ,{ignoreQueryPrefix : true})


const autoscroll = () =>{
  //new message 
  const $newMessage = $messages.lastElementChild
  //height of new message 
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  //visible height
  const visibleHeight = $messages.offsetHeight
  console.log("visible height is " ,visibleHeight)
  //height of message container 
  const containerHeight = $messages.scrollHeight
  console.log("containerHeight is ",containerHeight)
  //how far have i scrolled ? 

  const scrollOffset = $messages.scrollTop + visibleHeight
  console.log("scrollOffset is ",scrollOffset)
  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
    console.log("scrolltop is ", $messages.scrollTop )
    
  }

}
//here message in second arguent is just message 
// socket.on('message', (message) => {
//   console.log(message);
//   const html = Mustache.render(messageTemplate,{
//     // message :message
//     message 
//   });
//   $messages.insertAdjacentHTML('beforeend', html)
// })

//here message in second argument is objectwith text and createdAt 
socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate,{
    username : message.username,
    // message :message
    message : message.text,
    createdAt : moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})


socket.on('locationMessage',(message)=>{
  console.log(message);
  const html = Mustache.render(locationMessageTemplate,{
    username : message.username,
    url: message.url,
    createdAt : moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend',html);
  autoscroll()
})

socket.on('roomData',({room,users})=>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html;
})

// document.querySelector('#message-form').addEventListener('submit', (e) => {
//   e.preventDefault();
//   // const message = document.querySelector('input').value;
//   //e.target is form
//   const message = e.target.elements.message.value
//   //without acknowledgement
//   // socket.emit('sendMessage', message);
//   //with acknowledgement
//   //here third argument is function which runs when event is acknowledged.
//   socket.emit('sendMessage', message, (error) => {
//     if (error) {
//       return console.log(error);
//     }
//     console.log('Message delievered!');
//   });

// })



$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');
  const message = e.target.elements.message.value
  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value= '';
    $messageFormInput.focus();


    if (error) {
      return console.log(error);
    }
    console.log('Message delievered!');
  });

})

// document.querySelector('#send-location').addEventListener('click', (e) => {
//   if (!navigator.geolocation) {
//     return alert('Geolocation is not supported by your browser');
//   }
//   navigator.geolocation.getCurrentPosition((position) => {
//     // socket.emit('sendLocation', {
//     //   latitude: position.coords.latitude,
//     //   longitude: position.coords.longitude
//     // })

//     socket.emit('sendLocation', {
//       latitude: position.coords.latitude,
//       longitude: position.coords.longitude
//     }, () => {
//       console.log('Location shared!');
//     })

//   })

// })


const $sendLocationButton = document.querySelector('#send-location');

$sendLocationButton.addEventListener('click', (e) => {

  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  $sendLocationButton.setAttribute('disabled','disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      $sendLocationButton.removeAttribute('disabled');
      console.log('Location shared!');
    })

  })

})

socket.emit('join',{username , room},(error)=>{
  if(error){
    alert(error);
    location.href = '/';
  }

});



