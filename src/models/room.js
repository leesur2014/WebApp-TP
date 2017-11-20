var db = require('../db');
var io = require('../io');

Room = {};

Room.getById = function (id) {
  return db.proc("room_get_by_id", [id]);
};

Room.getAllPublicRooms = function () {
  return db.any("SELECT * FROM public_rooms");
}

Room.getPublicRoomById = function (room_id) {
  return db.one("SELECT * FROM public_rooms WHERE id = $1", room_id);
}

Room.getInfoById = async function (room_id) {
  let room = await db.proc("room_get_by_id", room_id)
  room.users = await db.any('SELECT id, nickname, observer, ready FROM room_get_users($1)', room.id)
  room.round_id = await db.proc('room_get_current_round', room.id, function (round) {
    if (round)
      return round.id;
    return null;
  });
  return room;
};

Room.startNewRound = function (room_id) {
  return db.proc('room_start_round', room_id)
    .then(function (round) {
      // reach here if new round started
      Room.getPublicRoomById(room_id)
        .then(function () {
          io.lounge.emit('room_change', {room_id: room_id});
        })
        .catch(function (e) {
          // reach here if room is private
          // this is not an error
        });

      io.room.to('room_' + room_id).emit('round_start', {round_id: round.id});

      var seconds = 60;
      var timer = setInterval(function () {
        db.one("SELECT * FROM open_rounds WHERE id = $1", round.id)
          .then(function(round) {
            seconds--;
            if (seconds <= 0)
            {
              // timeout, end this round
              console.log("round", round.id, "timed out");
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
              console.log("round", round.id, "has", seconds, "left");
              io.room.to('room_' + room_id).emit('count_down', {seconds: seconds});
            }
          })
          .catch(function(e) {
            // reach here if the round is already ended
            // or an error happens
            console.log(e);
            clearInterval(timer);
          });
      }, 1000);
      return round;
    })
    .catch(function (err) {
      // reach here if new round cannot be started
      // this is not an error
      return null;
    });
};



module.exports = Room;
