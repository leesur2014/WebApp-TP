var express = require('express');
var router = express.Router();
var db = require('../models/db');
var User = require('../models/user');
var Room = require('../models/room');
var randomstring = require("randomstring");


function send_error(res, err, code = -1)
{
  res.send({
    code: code,
    error: err.message
  });
}


router.use('/', function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't, return 401
    res.status(401);
    res.send({code: 401, error: "unauthorized"});
});


router.get('/me', function(req, res) {
  res.send(req.user);
})

router.get('/user/:id(\\d+)', function(req, res) {
  User.getById(req.params.id)
  .then(function (user) {
    user.fb_id = undefined;
    res.send(user);
  })
  .catch(function (err)
  {
    send_error(res, err);
  });
});

router.get('/lounge', function(req, res) {
  db.any("SELECT * FROM public_rooms")
    .then(function (data) {
      res.send({
        code: 0,
        data: data
      });
    });
});



router.get('/room', function(req, res) {
  if (req.user.room_id)
  {
    Room.getInfoById(req.user.room_id)
      .then(function (data) {
        res.send({
          code: 0,
          data: data
        });
      })
      .catch(function (err)
      {
        send_error(res, err);
      });
  }
  else {
    res.send({
      code: -1,
      error: "You are not in a room"
    })
  }
});

router.post('/room', function(req, res) {
  // console.log(req.user);
  req.user.createRoom(req.body.passcode || '')
    .then(function (room) {
      res.send({
        code: 0,
        data: room
      });
    })
    .catch(function (err) {
      send_error(res, err);
    });
});

router.post('/enter', function(req, res) {
  // TODO input validation
  req.user.enterRoom(req.body.room_id, req.body.passcode || '', req.body.observer || false)
    .then(function (room) {
      res.send({
        code: 0,
        data: room
      });
    })
    .catch(function (err) {
      send_error(res, err);
    });
})

router.post('/exit', function(req, res) {
  // console.log(req.user);
  req.user.exitRoom(req.body.force || false)
    .then(function (room) {
      res.send({
        code: 0
      });
    })
    .catch(function (err) {
      send_error(res, err);
    });
});



router.get('/rooms', function(req, res) {
  res.send('respond with a resource');
});


module.exports = router;
