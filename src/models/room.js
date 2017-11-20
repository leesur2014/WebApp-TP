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

module.exports = Room;
