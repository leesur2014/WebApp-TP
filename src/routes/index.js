var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    if (req.isAuthenticated())
        return res.redirect('/game-center');
    res.render('index');
});

router.get('/game-center',function(req,res) {
    // if not authenticated, redirect to login page
    if (!req.isAuthenticated())
        return res.redirect('/');
    res.render('game-center');
});

router.get('/room', function(req,res) {
    if (!req.isAuthenticated())
        res.redirect('/');
    res.render('room');
});

module.exports = router;
