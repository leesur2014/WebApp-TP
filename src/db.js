var promise = require('bluebird');
var monitor = require('pg-monitor');

var options = {
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/draw';
var db = pgp(connectionString);

monitor.attach(options); // attach to all events at once;

module.exports = db;
