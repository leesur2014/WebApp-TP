var db = require('./db');

Room = {};

Room.getById = function (id) {
  return db.proc("room_get_by_id", [id]);
}


Room.getInfoById = async function (room_id) {
  let room;
  room = await Room.getById(room_id);
  room.users = await db.any('SELECT id, nickname, observer, ready FROM users WHERE room_id = $1', room_id);
  room.round = await db.oneOrNone('SELECT id, painter_id, started_at FROM room_get_current_round($1)', room_id);
  return room;
}


module.exports = Room;
