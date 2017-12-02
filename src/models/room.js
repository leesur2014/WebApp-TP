var db = require('../db');
var io = require('../io');

Room = {};

Room.getById = function (id) {
  return db.proc("SELECT * FROM rooms_extra WHERE id = $1", [id]);
};

Room.getAllPublicRooms = function () {
  return db.any("SELECT * FROM public_rooms");
}

Room.getPublicRoomById = function (room_id) {
  return db.one("SELECT * FROM public_rooms WHERE id = $1", room_id);
}

Room.getInfoById = async function (room_id) {
  let room = await db.one("SELECT * FROM rooms_extra WHERE id = $1", room_id);
  room.users = await db.any('SELECT id FROM users WHERE room_id = $1 ORDER BY id', room.id);
  return room;
};

module.exports = Room;
