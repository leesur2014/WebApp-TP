var db = require('./db');
var redis = require('./redis').pubClient;
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
    var user = this;
    return db.proc('user_enter_room', [this.id, room_id, passcode, observer])
      .then(function () {
        var evt = {
          event: "user_enter",
          data: {
            user_id: user.id
          }
        };
        redis.publish("room:" + room_id, JSON.stringify(evt));
      });
  }


  exitRoom(force = false) {
    var user = this;
    return db.proc('user_exit_room', [this.id, force])
      .then(function () {
        var evt = {
          event: "user_exit",
          data: {
            user_id: user.id
          }
        };
        redis.publish("room:" + user.room_id, JSON.stringify(evt));
      });
  }

  setReady(state) {
    var user = this;
    return db.proc('user_change_state', [this.id, state])
      .then(function () {
        var evt = {
          event: "user_change_state",
          data: {
            user_id: user.id,
            ready: state
          }
        };
        redis.publish("room:" + user.room_id, JSON.stringify(evt));
        Room.startNewRound(user.room_id);
      });
  }

  guess(submission) {
    var user = this;
    return db.proc('user_guess', [this.id, submission], (d) => d.user_guess)
      .then(function (correct) {
        var evt = {
          event: "user_guess",
          data: {
            user_id: user.id,
            correct: correct
          }
        };
        redis.publish("room:" + user.room_id, JSON.stringify(evt));
        if (correct)
        {
          // TODO check if this round can end early
        }
        return correct;
      });
  }

  draw(image) {
    return db.proc('user_draw', [this.id, image])
      .then(function () {
        var evt = {
          event: "user_draw",
          data: {
            image: image
          }
        };
        redis.publish("room:" + user.room_id, JSON.stringify(evt));
      });
  }

}


module.exports = User;
