var db = require('./db');
var redis = require('./redis').pubClient;

Room = {};

Room.getById = function (id) {
  return db.proc("room_get_by_id", [id]);
};


Room.getInfoById = async function (room_id) {
  let room;
  room = await Room.getById(room_id);
  room.users = await db.any('SELECT id, nickname, observer, ready FROM users WHERE room_id = $1', room_id);
  room.round = await db.oneOrNone('SELECT id, painter_id, started_at FROM room_get_current_round($1)', room_id);
  return room;
};

Room.startNewRound = function (room_id) {
  return db.proc('room_start_new_round', room_id)
    .then(function (round) {
      // push to redis
      round.answer = undefined;
      message = JSON.stringify({
        event: "round_started",
        data: round
      });
      redis.publish("room:" + room_id, message);
      return round;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
};



module.exports = Room;
