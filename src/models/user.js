var db = require('./db');
var Room = require('./room');

class User {

  static getById(user_id) {
    return db.proc("user_get_by_id", [user_id])
      .then(function (user) {
        Object.setPrototypeOf(user, User.prototype);
        return user;
      });
  }

  static getOrCreate(fb_id, displayName) {
    return db.proc("user_get_or_create", [fb_id, displayName])
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
    // TODO push to redis channel
  }


  enterRoom(room_id, passcode = '', observer = false) {
    return db.proc('user_enter_room', [this.id, room_id, passcode, observer])
    // TODO push to redis channel
  }


  exitRoom(force = false) {
    return db.proc('user_exit_room', [this.id, force]);
    // TODO push to redis channel
  }

  setReady(state) {
    let user = this;
    return db.proc('user_set_ready_status', [this.id, state])
      .then(function () {
        Room.startNewRound(user.room_id);
        return true;
      });
  }

  submit(guess) {
    return db.proc('user_submit_answer', [this.id, guess]);
    // TODO push to redis channel
  }

  draw(image) {
    return db.proc('user_submit_image', [this.id, image]);
    // TODO push to redis channel
  }

}


module.exports = User;
