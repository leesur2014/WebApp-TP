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
      io.room.to('room_' + room_id).emit('round_start', {round_id: round.id});

      var seconds = 60;
      var timer = setInterval(function () {
        db.proc("round_get_by_id", round.id)
          .then(function(round) {
            seconds--;
            if (seconds <= 0)
            {
              // timeout, end this round
              console.log("round", round.id, "timed out");
              clearInterval(timer);
              db.proc('round_end', round_id)
                .then(function(round) {
                  io.room.to('room_' + round.room_id).emit('round_end', {round_id: round.id});
                })
                .catch(function(e) {
                  // this is not an error
                  console.log(e);
                });
              return;
            }
            if (round.ended_at === null)
            {
              // the round is still open, send count_down event to clients
              console.log("round", round.id, "has", seconds, "left");
              io.room.to('room_' + room_id).emit('count_down', {seconds: seconds});
            } else {
              console.log("round", round.id, "ended prematurely");
              clearInterval(timer);
            }
          })
          .catch(function(e) {
            console.log(e);
            clearInterval(timer);
          })
      }, 1000);
      return round;
    })
    .catch(function (err) {
      // this is not an error
      console.log(err);
      return null;
    });
};



module.exports = Room;
