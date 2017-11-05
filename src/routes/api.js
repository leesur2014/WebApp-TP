var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var randomstring = require("randomstring");


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
    res.send({
      code: -1,
      error: err.message
    })
  });
});

router.get('/room', function(req, res) {
  res.send('respond with a resource');
});



router.get('/rooms', function(req, res) {
  res.send('respond with a resource');
});



router.get('/rooms', function(req, res) {
  res.send('respond with a resource');
});



router.get('/rooms', function(req, res) {
  res.send('respond with a resource');
});


module.exports = router;
