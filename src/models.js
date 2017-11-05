var db = require('./db');
var randomstring = require("randomstring");

var user = {};
var room = {};
var round = {};
var dictionary = {};

dictionary._getRandomWord = function (tx) {
  return tx.one('SELECT word FROM dictionary OFFSET ' +
    'FLOOR(RANDOM() * (SELECT COUNT(*) FROM dictionary)) LIMIT 1', c => c.word);
}

user._getById = function (tx, user_id) {
  return tx.one('SELECT * FROM users WHERE id = $1', [user_id]);
};

user._getByIdSafe = function (tx, user_id) {
  return tx.one('SELECT id, nickname, score_draw, score_guess, score_penalty, ' +
    'room_id, ready, online, joined_at FROM users WHERE id = $1', [user_id]);
};

user._create = function (tx, fb_id, nickname, access_token, token_expire_at) {
  return tx.one('INSERT INTO users (fb_id, nickname, access_token, token_expire_at)' +
    'VALUES ($1, $2, $3, $4) RETURNING id',
    [fb_id, nickname, access_token, token_expire_at]);
};

user._setReady = function (tx, user_id) {
  return tx.none('UPDATE users SET ready = TRUE WHERE id = $1', [user_id]);
};

user._clearReady = function (tx, user_id) {
  return tx.none('UPDATE users SET ready = FALSE WHERE id = $1', [user_id]);
};

user._setOnline = function (tx, user_id) {
  return tx.none('UPDATE users SET online = TRUE WHERE id = $1', [user_id]);
};

user._clearOnline = function (tx, user_id) {
  return tx.none('UPDATE users SET online = FALSE WHERE id = $1', [user_id]);
};

user.login = function (user_id) {

}

user.logout = function (user_id) {

}

user.signalReady = function (user_id) {

};

user.joinRoomAsPlayer = function (user_id, room_id, passcode) {

};

user.joinRoomAsObserver = function (user_id, room_id, passcode) {

};

user.leaveRoom = function (user_id) {

};

user.createRoom = function (user_id, isPrivate)
{

}


room._getById = function (tx, room_id) {
  return tx.one('SELECT * FROM rooms WHERE id = $1 AND deleted_at IS NULL', [room_id]);
};

room._countPlayers = function (tx, room_id) {
  return tx.one('SELECT count(*) FROM users WHERE room_id = $1 AND observer = FALSE',
    [room_id], c => 0+c.count)
};

room._getPlayers = function (tx, room_id) {
  return tx.many('SELEC id, nickname, ready FROM users WHERE room_id = $1 ' +
    'AND observer = FALSE', [room_id]);
};

room._getCurrentRound = function (tx, room_id) {
  return tx.oneOrNone('SELECT * FROM rounds WHERE ended_at IS NULL AND ' +
    'room_id = $1', [room_id]);
};

room._isEveryOneReady = function (tx, room_id) {
  return tx.one('SELECT count(id) FROM users WHERE observer = FALSE AND ' +
    'room_id = $1 AND ready = FALSE',[room_id], c => 0+c.count)
  .then(count => count === 0);
};

room._create = function (tx, isPrivate) {
  isPrivate = false || isPrivate;
  var passcode = null;
  if (isPrivate)
  {
    passcode = randomstring.generate({
      length: 6,
      charset: 'numeric'
    });
  }
  return tx.one('INSERT INTO rooms (passcode) VALUES ($1) RETURNING *', [passcode]);
};

room.getPublicRoomsWithUsers = function () {
  return db.any('SELECT rooms.id AS room_id, rooms.created_at, ' +
    'users.id AS user_id, users.nickname ' +
    'FROM rooms JOIN users ON users.room_id = rooms.id ' +
    'WHERE rooms.passcode IS NULL AND rooms.deleted_at IS NULL ' +
    'ORDER BY rooms.id');
}

room.getPublicRooms = function () {
  return db.any('SELECT rooms.id, rooms.created_at, count(users.id)' +
    'FROM rooms JOIN users ON users.room_id = rooms.id ' +
    'WHERE rooms.passcode IS NULL AND rooms.deleted_at IS NULL ' +
    'GROUP BY rooms.id ORDER BY rooms.id');
}


room._startNewRound = function (tx, room_id) {
  // get a list of non observer users (players) in this room
  // select a random user as the painter
  // select a random word as the answer
  // create a row for each of the rest players in round_user table
  // clear every player's ready bit
  // create one row in rounds table
  // return that row
}

round._end = function (tx, round_id) {
  return tx.one('UPDATE rounds SET ended_at = current_timestamp ' +
    'WHERE id = $1 RETURNING *', [round_id]);
  // TODO add score to each guesser
  // add score to the painter
}

round._getById = function (tx, round_id) {
  return tx.one('SELECT * FROM round WHERE id = $1', [round_id]);
}

round._submit = function (tx, round_id, user_id, submission) {
  return tx.one('UPDATE round_user SET submission = $3, submitted_at = current_timestamp ' +
    'WHERE user_id = $1 AND round_id = $2 AND submission IS NULL RETURNING user_id')
}



module.exports = {
  user: user,
  room: room,
  round: round
};
