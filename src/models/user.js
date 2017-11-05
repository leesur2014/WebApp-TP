var db = require('./db');

class User {

  static async getById(user_id) {
    let user = {};
    user = await db.one("SELECT * FROM users WHERE id = $1", [user_id]);
    user.prototype = User;
    return user;
  }

  static async getOrCreate(fb_id, displayName) {
    let user;
    try {
      user = await db.one("SELECT * FROM users WHERE fb_id = $1", [fb_id]);
    } catch(e) {
        user = await db.one("INSERT INTO users (fb_id, nickname) VALUES ($1, $2) RETURNING *", [fb_id, displayName]);
    }
    user.prototype = User;
    return user;
  }

}


module.exports = User;
