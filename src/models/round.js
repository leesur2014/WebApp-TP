var debug = require('debug')('round');
var db = require('../db');
var io = require('../io');

Round = {};


Round.getInfoById = function (id) {
  return db.one("SELECT * FROM rounds WHERE id = $1", id)
    .then(function (round) {
      return db.any('SELECT round_user.user_id, users.nickname, round_user.score, round_user.submission' +
        ' FROM round_user INNER JOIN users ON round_user.user_id=users.id WHERE round_user.round_id = $1', id)
        .then(function (data) {
          round.users = data;
          return round;
        });
    });
};

Round.tryToEnd = function (round_id) {
  db.proc("try_round_end", round_id)
    .then(function (round) {
      debug("round", round.id, "ended");
      io.lounge.emit('room_change', {room_id: round.room_id});
      io.room.to("room_" + round.room_id).emit('round_end', {round_id: round.id});
    })
    .catch(function (e)
    {
      // this is not an error
    });
};


Round.tryToStart = function (room_id) {
  return db.proc('room_start_round', room_id)
    .then(function (round) {
      // reach here if new round is started
      db.one("SELECT * FROM public_rooms WHERE id = $1", room_id)
        .then(function () {
          // only emit to lounge if room is public
          io.lounge.emit('room_change', {room_id: room_id});
        })
        .catch(function () {
          // not an error
        });

      io.room.to('room_' + room_id).emit('round_start', {round_id: round.id});

      var seconds = 60;
      var timer = setInterval(function () {
        db.one("SELECT * FROM open_rounds WHERE id = $1", round.id)
          .then(function(round) {
            // reach here if the round is still open
            if (--seconds <= 0) {
              // timeout, end this round
              debug("round", round.id, "timed out");
              clearInterval(timer);
              db.proc('round_end', round.id)
                .then(function() {
                  io.room.to('room_' + round.room_id).emit('round_end', {round_id: round.id});
                })
                .catch(function(e) {
                  // reach here if the round is already ended
                  // this is not an error
                });
            } else {
              debug("round", round.id, "has", seconds, "left");
              io.room.to('room_' + room_id).emit('count_down', {seconds: seconds});
            }
          })
          .catch(function(e) {
            // reach here if the round has already ended
            // or an error happens
            clearInterval(timer);
          });
      }, 1000);
      return round;
    })
    .catch(function (err) {
      // reach here if new round cannot be started
      // this is not an error
      return null
    });
};

module.exports = Round;
