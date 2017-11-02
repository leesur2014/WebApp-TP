var express = require('express');
var router = express.Router();

router.get('/login', function(req, res) {
  res.send('respond with a resource');
});


router.get('/logout', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
