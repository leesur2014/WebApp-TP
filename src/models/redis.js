var redis = require("redis");

var client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

function logError(err) {
  console.log("redis error: " + err);
}

client.on("error", logError);

module.exports.pubClient = client;

module.exports.createClient = function (){
  var client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  });

  client.on("error", logError);

  return client;
};
