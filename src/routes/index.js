var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res) {
    res.render('login');
});

// UI Starts
router.get('/game-center',function(req,res) {
    // if not authenticated, redirect to login page
    if (!req.isAuthenticated())
        res.redirect('/');
    res.render('gameCenter');
});

router.get('/change-nickname',function(req,res) {
    if (!req.isAuthenticated())
        res.redirect('/');
    res.render('change-nickname');
});

router.get('/join-room',function(req,res) {
    if (!req.isAuthenticated())
        res.redirect('/');
    res.render('join-room');
});

router.get('/create-room',function(req,res) {
    if (!req.isAuthenticated())
        res.redirect('/');
    res.render('create-room');
});
// UI Ends

module.exports = router;