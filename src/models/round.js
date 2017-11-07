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
      // send to socketio send to socketio
      return round;
    })
    .catch(function (err) {
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
      // send to socketio
      return round;
    })
    .catch(function (err) {
      return null;
    });
};


module.exports = Round;
