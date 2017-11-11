var db = require('./db');

Room = {};

Room.getById = function (id) {
  return db.proc("room_get_by_id", [id]);
};


Room.getInfoById = async function (room_id) {
  let room;
  room = await Room.getById(room_id);
  room.users = await db.any('SELECT id, nickname, observer, ready FROM room_get_users($1)', room_id);
  room.round = await db.oneOrNone('SELECT id, painter_id, started_at FROM room_get_current_round($1)', room_id);
  return room;
};

Room.startNewRound = function (room_id) {
  return db.proc('room_start_round', room_id)
    .then(function (round) {
      delete round.answer;
      // TODO send to socket.io
      return round;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
};



module.exports = Room;
