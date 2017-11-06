'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fs = require('fs');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var passport = require('passport');

var api = require('./routes/api');
//var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var expressWs = require('express-ws')(app);

/* Facebook authentication middleware */
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({'facebook.id': profile.id}, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

/*
 *  connect to controllers
 */
var redirect = require('./controllers/redirect');

// define PORT
const PORT = 8000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new RedisStore({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded());

app.use(passport.initialize());
app.use(passport.session());

// UI Starts
app.get('/game-center',function(req,res) {
    res.sendfile('./public/game-center.html');
});
app.get('/change-nickname',function(req,res) {
    res.sendfile('./public/change-nickname.html');
});
app.get('/join-room',function(req,res) {
    res.sendfile('./public/join-room.html');
});
app.get('/create-room',function(req,res) {
    res.sendfile('./public/create-room.html');
});
// UI Ends

//
//app.use('/', routes);
//app.use('/static', express.static(path.join(__dirname, 'public')));
//app.use('/users', users);
//app.use('/api', api);

/// catch 404 and forwarding to error handler
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});


// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function(err, req, res, next) {
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
//}

// production error handler
// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {successRedirect: '/game',
failureRedirect: '/game'}));

app.get('/', function(req, res) {
    console.log('you need login!');
    redirect.directLogin(req, res);
});

app.get('/game', function(req, res) {
    console.log('success!');
    redirect.directGameCenter(req, res);
});


app.listen(PORT, () =>
    console.log(`your servering is running on port ${PORT}`)
);

module.exports = app;

