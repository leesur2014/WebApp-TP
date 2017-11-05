var db = require('./db');

Room = {};

Room.getById = async function (id) {
  return await db.one("SELECT * FROM rooms WHERE id = $1", [id]);
}


Room.getInfoById = async function (room_id) {
  let room;
  room = await Room.getById(room_id);
  room.users = await db.any('SELECT id, nickname, observer, ready FROM users WHERE room_id = $1', room_id);
  room.round = await db.oneOrNone('SELECT id, painter_id, started_at FROM room_get_current_round($1)', room_id);
  return room;
}


module.exports = Room;
