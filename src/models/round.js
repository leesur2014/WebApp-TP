var db = require('../db');
var io = require('../io');

Round = {};

Round.getInfoByUserId = function (user_id) {
  return db.proc("user_get_current_round", [user_id])
    .then(function (round) {
      if (!round)
      {
        return null;
      }
      return db.any('SELECT user_id, score FROM round_user WHERE round_id = $1', round.id)
        .then(function (data) {
          round.users = data;
          return round;
        });
    });
};

Round.getInfoById = function (id) {
  return db.proc("round_get_by_id", [id])
    .then(function (round) {
      return db.any('SELECT user_id, score FROM round_user WHERE round_id = $1', id)
        .then(function (data) {
          round.users = data;
          return round;
        });
    });
};

Round.tryToEnd = function (round_id) {
  db.proc("try_round_end", round_id)
    .then(function (round) {
      console.log("round end: ", round.id);
      io.lounge.emit('room_change', {room_id: round.room_id});
      io.room.to("room_" + round.room_id).emit('round_end', {round_id: round.id});
    })
    .catch(function (e)
    {
      console.log(e);
      // this is not an error
    });
};

module.exports = Round;
