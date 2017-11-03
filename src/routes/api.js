var express = require('express');
var router = express.Router();
var models = require('../models');

router.get('/rooms', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
