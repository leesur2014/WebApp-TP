const io = require('socket.io')();
var db = require('./db');

// two namespaces
var lounge = io.of('/lounge');
var room = io.of('/room');

var socketToUserID = {};

var auth = function (socket, next) {
  let token = socket.handshake.query.token;
  db.one('SELECT * FROM users WHERE token = $1', token || 'token_missing')
    .then(function (user) {
      socketToUserID[socket.id] = user.id;
      return next();
    })
    .catch(function (err) {
      return next();
    });
};

lounge.use(auth);
room.use(auth);

lounge.on('connection', function(socket) {

  if (socketToUserID[socket.id] == undefined)
  {
    socket.disconnect();
    console.log("disconnect due to auth failure");
    return;
  }

  var socketId = socket.id;
  var userId = socketToUserID[socket.id];

  console.log("user", userId, "connected to /lounge");

  socket.on('disconnecting', function(reason) {
    console.log("socket " + socketId + " disconnecting");
    delete socketToUserID[socketId];
  });

  socket.on('error', function(reason) {
    console.log("socket " + socketId + " error");
    delete socketToUserID[socketId];
  });

});


room.on('connection', function(socket){

  if (socketToUserID[socket.id] == undefined)
  {
    socket.disconnect(true);
    console.log("disconnect due to auth failure");
    return;
  }

  var socketId = socket.id;
  var userId = socketToUserID[socket.id];

  console.log("user", userId, "connected to /room");

  socket.on('disconnecting', function(reason) {
    console.log("socket " + socketId + " disconnecting");
    delete socketToUserID[socketId];
  });

  socket.on('error', function(reason) {
    console.log("socket " + socketId + " error");
    delete socketToUserID[socketId];
  });

  db.oneOrNone('SELECT room_id FROM users WHERE id = $1', userId, r => r.room_id)
    .then(function (roomId) {
      console.log("user", userId, "in room", roomId);
      if (roomId == null)
      {
        console.log("disconnect due to not in a room");
        socket.disconnect(true);
      } else {
        socket.join("room_" + roomId);
      }
    });

});


module.exports = {
  lounge: lounge,
  room: room,
  io: io
};
