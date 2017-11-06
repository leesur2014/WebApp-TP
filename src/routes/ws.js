var express = require('express');
var router = express.Router();
var db = require('../models/db');
var User = require('../models/user');
var Room = require('../models/room');
var redis = require('../models/redis');


router.use('/', function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't, return 401
    res.status(401);
    res.send({code: 401, error: "unauthorized"});
});





router.ws('/room/:id(\\d+)', function(ws, req) {

  if (req.user.room_id != req.params.id)
  {
    ws.close();
    return;
  }

  var redis = redis.createClient();
  redis.subscribe("room:"+req.params.id);

  ws.on('error', function(error) {
    console.log('ws error: ' + error);
    ws.close();
  });
  //
  ws.on('close', function(code, reason) {
    console.log('ws closed');
    redis.unsubscribe();
    redis.quit();
  });

  redis.on("message", function(channel, message) {
    console.log(message);
    ws.send(message);
    var data = JSON.parse(message);
    if (data.event == 'user_exit' && data.data.user_id == req.user.id)
    {
      ws.close();
    }
  });

});









module.exports = router;
