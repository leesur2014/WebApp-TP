// var promise = require('bluebird');

var options = {
  // promiseLib: promise
};

const config = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  poolSize: 10
}

var pgp = require('pg-promise')(options);

// https://github.com/vitaly-t/pg-promise/issues/389
const moment = require('moment');
// 1114 is OID for timestamp in Postgres
pgp.pg.types.setTypeParser(1114, str => moment.utc(str).format());

var db = pgp(config);

module.exports = db;
