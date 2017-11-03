var promise = require('bluebird');
var monitor = require('pg-monitor');

var options = {
  promiseLib: promise
};

const config = {
  host: 'localhost',
  port: 5432,
  database: 'draw',
  user: 'jzhong',
  password: 'testtest',
  poolSize: 10
}

var pgp = require('pg-promise')(options);
var db = pgp(config);

monitor.attach(options); // attach to all events at once;

module.exports = db;
