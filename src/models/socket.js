var io = require('socket.io-emitter')({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});


io.redis.on('error', onError);

function onError(err){
  console.log("redis error: " + err);
}

module.exports = io;
