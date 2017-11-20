var db = require('../db');
var Room = require('./room');
var randomstring = require('randomstring');

var io = require('../io');


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
    return db.proc("user_login", [fb_id, displayName, token])
      .then(function (user) {
        Object.setPrototypeOf(user, User.prototype);
        io.lounge.emit('user_login', {user_id: user.id});
        return user;
      });
  }

  logout() {
    io.lounge.emit('user_logout', {user_id: this.id});
    return db.proc('user_logout', this.id);
  }

  setNickname(nickname) {
    return db.one('UPDATE users SET nickname = $1 WHERE id = $2 RETURNING *', [nickname, this.id]);
  }

  createRoom(passcode = '') {
    return db.proc('user_create_room', [this.id, passcode])
      .then(function (room) {
        io.lounge.emit('room_create', {room_id: room.id});
        return room;
      });
  }


  enterRoom(room_id, passcode = '', observer = false) {
    var user = this;
    return db.proc('user_enter_room', [this.id, room_id, passcode, observer])
      .then(function () {
        io.room.to('room_' + room_id).emit('user_enter', {user_id: user.id});
        io.lounge.emit('room_change', {room_id: room_id});
      });
  }


  exitRoom(force = false) {
    var user = this;
    return db.proc('user_exit_room', [user.id, force])
      .then(function () {
        io.room.to('room_' + user.room_id).emit('user_exit', {user_id: user.id});
        // attempt to delete this room
        db.proc('room_delete', user.room_id)
          .then(function () {
            console.log("room delete: ", user.room_id);
            io.lounge.emit('room_delete', {room_id: user.room_id})
          })
          .catch(function () {
            // reach here if room cannot be deleted
            io.lounge.emit('room_change', {room_id: user.room_id});
          });
      });
  }

  setReady(state) {
    var user = this;
    return db.proc('user_change_state', [this.id, state])
      .then(function () {
        io.room.to('room_' + user.room_id)
          .emit('user_change', {user_id: user.id, ready: state});

        if (state)
        {
          return Room.startNewRound(user.room_id);
        }
      })
  }

  guess(submission) {
    var user = this;
    return db.proc('user_guess', [this.id, submission], (d) => d.user_guess)
      .then(function (correct) {
        io.room.to('room_' + user.room_id)
          .emit('user_guess', {user_id: user.id, correct: correct});

        if (correct)
        {
            db.proc("user_get_current_round", user.id)
              .then(function (round) {
                if (round)
                {
                  db.proc("try_round_end", round.id)
                    .then(function () {
                      console.log("round end: ", round.id);
                      io.lounge.emit('room_change', {room_id: user.room_id});
                      io.room.to("room_" + user.room_id).emit('round_end', {round_id: round.id});
                    })
                    .catch(function (e)
                    {
                      console.log(e);
                      // this is not an error
                    });
                }
              })
        }

        return correct;
      });
  }

  draw(image) {
    io.room.to('room_' + this.room_id).emit('user_draw', {image: image});
    return db.proc('user_draw', [this.id, image]);
  }

}


module.exports = User;
