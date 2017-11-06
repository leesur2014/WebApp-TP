var db = require('./db');
var redis = require('./redis').pubClient;

Round = {};

Round.end = function (round_id) {
  return db.proc('round_end', round_id)
    .then(function (round) {
      var evt = {
        event: "round_end",
        data: round
      };
      redis.publish("room:" + round.room_id, JSON.stringify(evt));
      return data;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
};



Round.abort = function (round_id) {
  return db.proc('round_abort', round_id)
    .then(function (round) {
      var evt = {
        event: "round_abort",
        data: round
      };
      redis.publish("room:" + round.room_id, JSON.stringify(evt));
      return data;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
};


module.exports = Round;
