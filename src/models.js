var db = require('./db');
var randomstring = require("randomstring");

var user = {};
var room = {};
var round = {};
var dictionary = {};

dictionary.getRandomWord() {
  return db.one('SELECT word FROM dictionary OFFSET ' +
    'FLOOR(RANDOM() * (SELECT COUNT(*) FROM dictionary)) LIMIT 1', c => c.word);
}

user.getById = function (user_id) {
  return db.one('SELECT * FROM users WHERE id = $1', [user_id]);
};

user.getByIdSafe = function (user_id) {
  return db.one('SELECT id, nickname, score_draw, score_guess, score_penalty, ' +
    'room_id, ready, online, joined_at FROM users WHERE id = $1', [user_id]);
};

user.create = function (fb_id, nickname, access_token, token_expire_at) {
  return db.one('INSERT INTO users (fb_id, nickname, access_token, token_expire_at)' +
    'VALUES ($1, $2, $3, $4) RETURNING id',
    [fb_id, nickname, access_token, token_expire_at]);
};


user.joinRoomAsPlayer = function (user_id, room_id, passcode) {

};

user.joinRoomAsObserver = function (user_id, room_id, passcode) {

};

user.leaveRoom = function (user_id) {

};

user.setReady = function (user_id) {
  // TODO: ensure user is in a valid room but is not in a round
  return db.none('UPDATE users SET ready = TRUE WHERE id = $1', [user_id]);
};

user.clearReady = function (user_id) {
  return db.none('UPDATE users SET ready = FALSE WHERE id = $1', [user_id]);
};

user.setOnline = function (user_id) {
  return db.none('UPDATE users SET online = TRUE WHERE id = $1', [user_id]);
};

user.clearOnline = function (user_id) {
  return db.none('UPDATE users SET online = FALSE WHERE id = $1', [user_id]);
};

room.getPublicRoomsWithNickname = function () {
  return db.any('SELECT rooms.id AS room_id, rooms.created_at, ' +
    'users.id AS user_id, users.nickname ' +
    'FROM rooms JOIN users ON users.room_id = rooms.id ' +
    'WHERE rooms.passcode IS NULL AND rooms.deleted_at IS NULL' +
    'ORDER BY rooms.id');
}

room.getPublicRooms = function () {
  return db.any('SELECT rooms.id, rooms.created_at, count(user.id)' +
    'FROM rooms JOIN users ON users.room_id = rooms.id ' +
    'WHERE rooms.passcode IS NULL AND rooms.deleted_at IS NULL' +
    'GROUP BY rooms.id ORDER BY rooms.id');
}

room.getById = function (room_id) {
  return db.one('SELECT * FROM rooms WHERE id = $1 AND deleted_at IS NULL', [room_id]);
};

room.countPlayers = function (room_id) {
  return db.one('SELECT count(*) FROM users WHERE room_id = $1 AND observer = FALSE',
    [room_id], c => 0+c.count)
}

room.getPlayers = function (room_id) {
  return db.many('SELEC id, nickname, ready FROM users WHERE room_id = $1 ' +
    'AND observer = FALSE', [room_id]);
}

room.create = function (isPrivate) {
  isPrivate = false || isPrivate;
  var passcode = null;
  if (isPrivate)
  {
    passcode = randomstring.generate({
      length: 6,
      charset: 'numeric'
    });
  }
  return db.one('INSERT INTO rooms (passcode) VALUES ($1) RETURNING id', [passcode]);
};

room.getCurrentRound = function (room_id) {
  return db.oneOrNone('SELECT * FROM rounds WHERE ended_at IS NULL AND ' +
    'room_id = $1', [room_id]);
}


round.start = function (room_id) {
  // get a list of non observer users (players) in this room
  // select a random user as the painter
  // select a random word as the answer
  // create a row for each of the rest players in round_user table
  // clear every player's ready bit
  // create one row in rounds table
}

round.end = function (round_id) {
  return db.one('UPDATE rounds SET ended_at = current_timestamp ' +
    'WHERE id = $1 RETURNING *', [round_id]);
  // TODO add score to each guesser
  // add score to the painter
}

round.getById = function (round_id) {

}

round.submitAnswer = function (round_id, user_id, submission) {
  // save the user's submission
  return db.one('UPDATE round_user SET submission = $3, submitted_at = current_timestamp ' +
    'WHERE user_id = $1 AND round_id = $2 AND submission IS NULL RETURNING user_id')
}



module.exports = {
  user: user,
  room: room,
  round: round
};
