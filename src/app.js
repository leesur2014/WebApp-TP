'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var debug = require('debug')('app');
var app = express();

var db = require('./db');
var api = require('./routes/api');
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var http = require('http').Server(app);

var io = require('./io').io;
io.attach(http);

app.use(logger('tiny'));

app.use(session({
    store: new RedisStore({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.urlencoded({
  extended: false,
  limit: 1200000  // 1.2MB
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/users', users);
app.use('/api', api);
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res) {
    if (!req.isAuthenticated()) {
        // if not authenticated, render login view
        return res.render('index');
    }
    if (req.user.room_id != null) {
        // render room view if the user is in a room
        return res.render('room', {user: req.user});
    } else {
        // render the game-center view if not in a room
        return res.render('game-center', {user: req.user});
    }
});

app.get('/score-board',function(req,res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    return res.render('score-board', {user: req.user});
});

app.get('/history',function(req,res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    return res.render('history', {user: req.user});
});


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err);
    });
} else {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.send('error');
  });
}

setInterval(function () {
    db.any('SELECT * FROM user_cleanup()')
        .then(function (users) {
            if (users)
                debug("logged out", users.length, "users");
        })
        .catch(function (e) {
            debug(e);
        });
}, process.env.USER_CLEAN_UP_INTERVAL || 29000);


if(!module.parent) {
    http.listen(process.env.PORT || 3000);
}

module.exports = {
    // for testing purpose
    server: http
};
