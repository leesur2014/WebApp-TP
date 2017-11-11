var db = require('./db');
var io = require('./socket');

Round = {};

Round.end = function (round_id) {
  return db.proc('round_end', round_id)
    .then(function (round) {
      io.to('room_' + round.room_id)
        .emit('round_end', {round_id: round_id});
    })
    .catch(function (err) {
      // this is an error
      console.log(err);
    });
};

Round.getInfoById = async function (id) {
  let round;
  round = await db.proc("round_get_by_id", [id]);
  round.users = await db.any('SELECT user_id, score FROM round_user WHERE round_id = $1', id);
  return round;
}

Round.abort = function (round_id) {
  return db.proc('round_abort', round_id)
    .then(function (round) {
      io.to('room_' + round.room_id)
        .emit('round_end', {round_id: round_id});
    })
    .catch(function (err) {
      // this is not an error
      console.log(err);
    });
};


module.exports = Round;
