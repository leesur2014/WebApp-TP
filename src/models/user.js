var db = require('./db');

class User {


  static async getById(user_id) {
    let user = {};
    user = await db.one("SELECT * FROM users WHERE id = $1", [user_id]);
    Object.setPrototypeOf(user, User.prototype);
    return user;
  }

  static async getOrCreate(fb_id, displayName) {
    let user;
    try {
      user = await db.one("SELECT * FROM users WHERE fb_id = $1", [fb_id]);
    } catch(e) {
      // possible race here
      user = await db.one("INSERT INTO users (fb_id, nickname) VALUES ($1, $2) RETURNING *", [fb_id, displayName]);
    }
    Object.setPrototypeOf(user, User.prototype);
    return user;
  }


    createRoom(passcode) {
      return db.proc('user_create_room', [this.id, passcode || ''])
      // TODO push to redis channel
    }


    enterRoom(room_id, passcode) {
      return db.proc('user_enter_room', [this.id, passcode || ''])
      // TODO push to redis channel
    }


    exitRoom(force) {
      return db.proc('user_exit_room', [this.id, force]);
      // TODO push to redis channel
    }

    setReady(state) {
      return db.proc('user_set_ready_status', [this.id, state]);
      // TODO push to redis channel
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
