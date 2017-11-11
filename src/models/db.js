// var promise = require('bluebird');

var options = {
  // promiseLib: promise
};

const config = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  poolSize: 10
}

var pgp = require('pg-promise')(options);
var db = pgp(config);

module.exports = db;
