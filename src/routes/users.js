var express = require('express');
var router = express.Router();

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      console.log(profile);
      return done(null, profile);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserialize " + id);
  done(null, {hello: "world"})
  // User.findById(id, function(err, user) {
  //   done(err, user);
  // });
});

router.get('/login', passport.authenticate('facebook'));

router.get('/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/user/login' }));


router.get('/logout', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
