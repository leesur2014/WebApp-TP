var express = require('express');
var router = express.Router();
var db = require('../db');
var User = require('../models/user');
var Room = require('../models/room');
var Round = require('../models/round');
var randomstring = require("randomstring");
var validator = require('validator');


function send_error(res, err = 'error', code = -1)
{
  return res.send({
    code: code,
    error: err.message || err
  });
}

function send_data(res, data)
{
  return res.send({
    code: 0,
    data: data
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


router.get('/lounge', function(req, res) {
  db.any("SELECT * FROM public_rooms")
    .then(function (data) {
      return send_data(res, data);
    })
    .catch(function (err)
    {
      return send_error(res, err);
    });
});


router.get('/me', function(req, res) {
  res.send(req.user);
});

router.post('/me', function(req, res) {
  if (req.body.nickname)
  {
    req.user.setNickname(validator.escape(req.body.nickname))
      .then(function (user) {
        return send_data(res, user);
      });
  }
  else {
    send_error(res, "nickname required");
  }
});

router.get('/user/:id(\\d+)', function(req, res) {
  User.getById(req.params.id)
    .then(function (user) {
      delete user.fb_id;
      delete user.token;
      delete user.room_id;
      return send_data(res, user);
    })
    .catch(function (err)
    {
      return send_error(res, err);
    });
});

router.get('/round/:id(\\d+)', function(req, res) {
  Round.getInfoById(req.params.id)
    .then(function (round) {
      if (round.painter_id == req.user.id)
      {
        send_data(res, round);
        return;
      }

      if (round.ended_at === null)
      {
        // do not display answer for ongoing rounds
        round.answer = '******';
      }
      for (var i = 0; i < round.users.length; i++)
      {
        if(round.users[i].user_id == req.user.id)
        {
          return send_data(res, round);
        }
      }
      return send_error(res, "Access denied");
    })
    .catch(function (err)
    {
      return send_error(res, err);
    });
});

router.get('/round', function(req, res) {
  Round.getInfoByUserId(req.user.id)
    .then(function (round) {
      if (round == null)
      {
        send_error(res, "You are not in a round");
      }
      if (round.painter_id != req.user.id)
      {
        round.answer = "********"
      }
      return send_data(res, round);
    })
    .catch(function (err)
    {
      return send_error(res, err);
    });
});


router.get('/room/:id(\\d+)', function (req, res) {
  Room.getPublicRoomById(req.params.id)
    .then(function (data) {
      return send_data(res, data);
    })
    .catch(function (err) {
      return send_error(res, err);
    });
});

router.get('/room', function(req, res) {
  if (req.user.room_id)
  {
    Room.getInfoById(req.user.room_id)
      .then(function (data) {
        return send_data(res, data);
      })
      .catch(function (err)
      {
        return send_error(res, err);
      });
  }
  else {
    return send_error(res, "You are not in a room");
  }
});



router.post('/room', function(req, res) {
  req.user.createRoom(req.body.passcode || '')
    .then(function (room) {
      return send_data(res, room);
    })
    .catch(function (err) {
      return send_error(res, err);
    });
});

router.post('/enter', function(req, res) {
  if (req.body.room_id === undefined || req.body.observer === undefined)
  {
    send_error(res, "missing params");
    return;
  }
  if (!validator.isBoolean(req.body.observer))
  {
    send_error(res, "observer should be boolean")
    return;
  }
  if (!validator.isNumeric(req.body.room_id))
  {
    send_error(res, "room_id should be number")
    return;
  }
  req.user.enterRoom(req.body.room_id, req.body.passcode || '', req.body.observer == 'true')
    .then(function (room) {
      send_data(res, room);
    })
    .catch(function (err) {
      send_error(res, err);
    });
})

router.post('/exit', function(req, res) {
  let force = req.body.force || "false";
  if (!validator.isBoolean(force))
  {
    send_error(res, "force should be boolean");
    return;
  }
  req.user.exitRoom(req.body.force === 'true')
    .then(function () {
      send_data(res, null);
    })
    .catch(function (err) {
      send_error(res, err);
    });
});

router.post('/ready', function(req, res) {
  if (req.body.ready === undefined)
  {
    send_error(res, "ready is required");
    return;
  }
  if (!validator.isBoolean(req.body.ready))
  {
    send_error(res, "ready should be boolean");
    return;
  }
  req.user.setReady(req.body.ready == 'true')
    .then(function () {
      return send_data(res, req.body.ready == 'true');
    })
    .catch(function (err) {
      return send_error(res, err);
    });
})

router.post('/guess', function(req, res) {
  if (req.body.submission === undefined)
  {
    send_error(res, "submission is required");
    return;
  }
  var submission = validator.escape(req.body.submission);
  req.user.guess(submission)
    .then(function (correct) {
      res.send({
        code: 0,
        correct: correct
      });
    })
    .catch(function (err) {
      send_error(res, err);
    });
})


router.post('/draw', function(req, res) {
  if (req.body.image === undefined)
  {
    send_error(res, "image is required");
    return;
  }
  if (!validator.isDataURI(req.body.image))
  {
    send_error(res, "image should be dataURI");
    return;
  }
  req.user.draw(req.body.image)
    .then(function () {
      send_data(res, null);
    })
    .catch(function (err) {
      send_error(res, err);
    });
})

module.exports = router;
