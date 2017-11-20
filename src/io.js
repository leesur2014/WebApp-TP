var io = require('socket.io')();
var debug = require('debug')('io');
var db = require('./db');

// two namespaces
var lounge = io.of('/lounge');
var room = io.of('/room');

function getUser(socket) {
  let token = socket.handshake.query.token;
  return db.one('SELECT * FROM users WHERE token = $1 AND online = TRUE', token || 'token_missing');
};

function pingUser(userId) {
  return db.proc('user_ping', userId)
    .catch(function (e) {
      debug(e);
    });
}

lounge.on('connection', function(socket) {
  getUser(socket)
    .then(function (user) {
      debug("user", user.id, "connected to /lounge");

      socket.conn.on('packet', function (packet) {
        debug("received", packet.type, "packet from user", user.id);
        if (packet.type === 'ping')
          pingUser(user.id);
      });

      socket.on('disconnecting', function(reason) {
        debug("socket", socket.id, "disconnecting");
      });

      socket.on('error', function(reason) {
        debug("socket", socket.id, "error:", reason);
      });

    })
    .catch(function (e) {
      debug("disconnect due to auth failure");
      socket.disconnect(true);
    });

});


room.on('connection', function(socket) {
  getUser(socket)
    .then(function (user) {
      debug("user", user.id, "connected to /room");

      if (user.room_id == null)
      {
        debug("user", user.id, "not in a room, disconnect");
        socket.disconnect(true);
        return;
      }

      debug("user", user.id, "in room", user.room_id)
      socket.join("room_" + user.room_id);

      socket.conn.on('packet', function (packet) {
        debug("received", packet.type, "packet from user", user.id);
        if (packet.type === 'ping')
          pingUser(user.id);
      });

      socket.on('disconnecting', function(reason) {
        debug("socket", socket.id, "disconnecting");
      });

      socket.on('error', function(reason) {
        debug("socket", socket.id, "error:", reason);
      });

      socket.on('user_draw_delta', function(data) {
        debug(data);
        db.proc('room_get_current_round', user.room_id)
          .then(function (round) {
            if (round && round.painter_id == user.id)
            {
              // only allow the painter to draw
              // TODO: validate data
              data.timestamp = new Date();
              room.to('room_' + user.room_id).emit('user_draw_delta', data);
            }
          })
          .catch(function (e) {
            debug(e);
          });
      });

    })
    .catch(function (e) {
      debug("disconnect due to auth failure");
      socket.disconnect(true);
    });
});


module.exports = {
  lounge: lounge,
  room: room,
  io: io
};
