var socketIO = require('socket.io');
var debug = require('debug')('socketio');


function onConnection(socket) {
  debug('a user connected');

  socket.on('error', function (error) {
    debug("error: " + error);
  });

}


module.exports = function (server) {
  var io = socketIO(server);

  io.on('connection', onConnection);

  return io;
};
