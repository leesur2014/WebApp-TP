var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


// UI Starts
router.get('/game-center',function(req,res) {
    console.log('hah');
    res.sendfile('./public/game-center.html');
});
router.get('/change-nickname',function(req,res) {
    res.sendfile('./public/change-nickname.html');
});
router.get('/join-room',function(req,res) {
    res.sendfile('./public/join-room.html');
});
router.get('/create-room',function(req,res) {
    res.sendfile('./public/create-room.html');
});
// UI Ends

module.exports = router;