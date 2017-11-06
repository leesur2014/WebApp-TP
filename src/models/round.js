var db = require('./db');

Round = {};

Round.end = function (round_id) {
  return db.many('SELECT * FROM round_end($1)', round_id)
    .then(function (data) {
      // can we remove this function?
      return data;
    })
    .catch(function (err) {
      console.log(err);
      return null;
    });
};
