const io = require('socket.io')();


io.use(function (socket, next) {
  let handshake = socket.handshake;
  console.log(handshake);
  return next();
});


io.on('connection', function(socket){
  console.log('a client connected')
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});


module.exports = io;
