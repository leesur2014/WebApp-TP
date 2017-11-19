const io = require('socket.io')();
var db = require('./db');

// two namespaces
var lounge = io.of('/lounge');
var room = io.of('/room');

function getUser(socket) {
  let token = socket.handshake.query.token;
  return db.one('SELECT * FROM users WHERE token = $1 AND online = TRUE', token || 'token_missing');
};

lounge.on('connection', function(socket) {
  getUser(socket)
    .then(function (user) {
      console.log("user", user.id, "connected to /lounge");

      socket.conn.on('packet', function (packet) {
        console.log("received", packet.type, "packet from user", user.id);
        db.proc('user_ping', user.id)
          .catch(function (e) {
            console.log(e);
          });
      });

      socket.on('disconnecting', function(reason) {
        console.log("socket", socket.id, "disconnecting");
      });

      socket.on('error', function(reason) {
        console.log("socket", socket.id, "error");
      });
    })
    .catch(function (e) {
      console.log("disconnect due to auth failure");
      socket.disconnect(true);
    });

});


room.on('connection', function(socket) {
  getUser(socket)
    .then(function (user) {
      console.log("user", user.id, "connected to /room");

      // console.log(socket.conn);

      socket.conn.on('packet', function (packet) {
        console.log("received", packet.type, "packet from user", user.id);
        db.proc('user_ping', user.id)
          .catch(function (e) {
            console.log(e);
          });
      });

      socket.on('disconnecting', function(reason) {
        console.log("socket", socket.id, "disconnecting");
      });

      socket.on('error', function(reason) {
        console.log("socket ", socket.id, "error");
      });

      if (user.room_id == null)
      {
        console.log("user", user.id, "not in a room, disconnect");
        socket.disconnect(true);
      } else {
        console.log("user", user.id, "in room", user.room_id)
        socket.join("room_" + user.room_id);
      }
    })
    .catch(function (e) {
      console.log("disconnect due to auth failure");
      socket.disconnect(true);
    });
});


module.exports = {
  lounge: lounge,
  room: room,
  io: io
};
