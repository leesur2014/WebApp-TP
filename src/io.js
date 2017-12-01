var io = require('socket.io')({
  pingTimeout: 2000,
  pingInterval: 10000
});
var debug = require('debug')('io');
var db = require('./db');


var lounge = io.of('/lounge');
var room = io.of('/room');
var round = io.of('/round');

function getUser(socket) {
  let token = socket.handshake.query.token;
  return db.one('SELECT * FROM users_extra WHERE token = $1', token || 'token_missing');
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
      debug("user", user.id, "connected to /lounge via", socket.id);

      socket.conn.on('packet', function (packet) {
        debug("received", packet.type, "packet from user", user.id);
        if (packet.type === 'ping')
          pingUser(user.id);
      });

      socket.on('disconnect', function(reason) {
        debug("socket", socket.id, "disconnected. reason:", reason);
        pingUser(user.id);
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
      debug("user", user.id, "connected to /room via", socket.id);

      if (user.room_id == null)
      {
        debug("user", user.id, "not in a room, disconnect");
        socket.disconnect(true);
        return;
      }

      debug("user", user.id, "in room", user.room_id);
      socket.join("room_" + user.room_id);

      socket.conn.on('packet', function (packet) {
        debug("received", packet.type, "packet from user", user.id);
        if (packet.type === 'ping')
          pingUser(user.id);
      });

      socket.on('disconnect', function(reason) {
        debug("socket", socket.id, "disconnected. reason:", reason);
        pingUser(user.id);
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



round.on('connection', function(socket) {
  getUser(socket)
    .then(function (user) {
      debug("user", user.id, "connected to /round via", socket.id);

      if (user.round_id == null)
      {
        debug("user", user.id, "is not in a round, disconnect");
        socket.disconnect(true);
        return;
      }

      if (user.painter || user.observer) {
        debug("user", user.id, "in round", user.round_id, "as a painter/observer");
        socket.join(`round_${user.round_id}`);
      } else {
        debug("user", user.id, "in round", user.round_id, "as a guesser");
        socket.join(`round_${user.round_id}_guesser`);
      }

    })
    .catch(function (e) {
      debug("disconnect due to auth failure");
      socket.disconnect(true);
    });
});


module.exports = {
  lounge: lounge,
  room: room,
  io: io,
  round: round
};
