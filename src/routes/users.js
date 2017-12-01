var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    User.login(profile.id, profile.displayName)
      .then(function (user) {
        // console.log(user);
        return done(null, user);
      })
      .catch(function(err) {
        // console.log(err);
        done(err);
      });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getById(id)
    .then(function (user) {
      done(null, user);
    })
    .catch(function(err) {
      // control reaches here if a logged in user is deleted from the DB
      done(null, null);
    });
});

router.get('/login', passport.authenticate('facebook'));

router.get('/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/' }));


router.get('/logout', function(req, res){
  req.user.logout();
  req.logout();
  res.redirect('/');
});

module.exports = router;
