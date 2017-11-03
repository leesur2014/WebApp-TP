var db = require('./db');

var user = {};
var room = {};
var round = {};

user.getById = function (user_id) {
  return db.one('SELECT * FROM users WHERE id = $1', [user_id]);
};

user.create = function (fb_id, nickname, access_token, token_expire_at) {
  return db.one('INSERT INTO users (fb_id, nickname, access_token, token_expire_at)' +
    'VALUES ($1, $2, $3, $4) RETURNING *',
    [fb_id, nickname, access_token, token_expire_at]);
}

user.setReady = function (user_id) {
  return db.none('UPDATE users SET ready = TRUE WHERE id = $1', [user_id]);
}

room.getById = function (room_id) {
  return db.oneOrNone('SELECT * FROM rooms WHERE id = $1 AND deleted_at IS NULL', [room_id]);
}

room.create = function (passcode) {
  passcode = null || passcode;
  return db.one('INSERT INTO rooms (passcode) VALUES ($1)', [passcode]);
}


module.exports = {
  user: user,
  room: room,
  round: round
};
