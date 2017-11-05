'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
<<<<<<< HEAD
var fs = require('fs');
=======

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var passport = require('passport');

>>>>>>> 2bfc5bb92834d14224490d2b1f9da6647b888ae1
var api = require('./routes/api');
//var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
<<<<<<< HEAD
var expressWs = require('express-ws')(app);
var configAuth = require('./config/auth');

/* Facebook authentication middleware */
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL
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
//
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);
//app.use('/api', api);

// catch 404 and forwarding to error handler
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});

// error handlers
=======
app.use(logger('dev'));

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

app.use('/', routes);
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/users', users);
app.use('/api', api);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
>>>>>>> 2bfc5bb92834d14224490d2b1f9da6647b888ae1


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

app.get('/', passport.authenticate('facebook', {successRedirect: '/game',
failureRedirect: '/login'}));

app.get('/login', function(req, res) {
    redirect.directLogin(req, res);
});

app.get('/game', function(req, res) {
    redirect.directGameCenter(req, res);
});


app.listen(PORT, () =>
    console.log(`your servering is running on port ${PORT}`)
);

module.exports = app;

