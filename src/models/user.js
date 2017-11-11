var db = require('./db');
var Room = require('./room');
var randomstring = require('randomstring');

var io = require('./socket');


class User {

  static getById(user_id) {
    return db.proc("user_get_by_id", [user_id])
      .then(function (user) {
        Object.setPrototypeOf(user, User.prototype);
        return user;
      });
  }

  static login(fb_id, displayName) {
    var token = randomstring.generate(32);
    return db.proc("user_get_or_create", [fb_id, displayName, token])
      .then(function (user) {
        Object.setPrototypeOf(user, User.prototype);
        return user;
      });
  }

  setNickname(nickname) {
    return db.one('UPDATE users SET nickname = $1 WHERE id = $2 RETURNING *', [nickname, this.id]);
  }


  createRoom(passcode = '') {
    return db.proc('user_create_room', [this.id, passcode])
      .then(function (room) {
        io.to('lounge').emit(
          'room_creat',
          {room_id: room.id});
        return room;
      })
  }


  enterRoom(room_id, passcode = '', observer = false) {
    var user = this;
    return db.proc('user_enter_room', [this.id, room_id, passcode, observer])
      .then(function () {
        io.to('room_' + room_id).emit('user_enter', {user_id: user.id});
      });
  }


  exitRoom(force = false) {
    var user = this;
    return db.proc('user_exit_room', [this.id, force])
      .then(function () {
        io.to('room_' + user.room_id).emit('user_exit', {user_id: user.id});
      });
  }

  setReady(state) {
    var user = this;
    return db.proc('user_change_state', [this.id, state])
      .then(function () {
        io.to('room_' + user.room_id)
          .emit('user_change', {user_id: user.id, ready: state});
        // TODO attempt to start a round
      });
  }

  guess(submission) {
    var user = this;
    return db.proc('user_guess', [this.id, submission], (d) => d.user_guess)
      .then(function (correct) {
        io.to('room_' + user.room_id)
          .emit('user_guess', {user_id: user.id, correct: correct});
        return correct;
      });
  }

  draw(image) {
    return db.proc('user_draw', [this.id, image])
      .then(function () {
        io.to('room_' + user.room_id).emit('user_draw');
      });
  }

}


module.exports = User;
