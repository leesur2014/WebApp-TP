var db = require('../db');
var io = require('../io');

Round = {};

Round.end = function (round_id) {
  return db.proc('round_end', round_id)
    .then(function (round) {
      io.room.to('room_' + round.room_id)
        .emit('round_end', {round_id: round_id});
      return null;
    })
    .catch(function (err) {
      // this is an error
      console.log(err);
      return null;
    });
};

Round.getInfoByUserId = function (user_id) {
  return db.proc("user_get_current_round", [user_id])
    .then(function (round) {
      if (!round)
      {
        return null;
      }
      return db.any('SELECT user_id, score FROM round_user WHERE round_id = $1', id)
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

Round.abort = function (round_id) {
  return db.proc('round_abort', round_id)
    .then(function (round) {
      io.room.to('room_' + round.room_id)
        .emit('round_end', {round_id: round_id});
      return null;
    })
    .catch(function (err) {
      // this is not an error
      console.log(err);
      return null;
    });
};



module.exports = Round;
