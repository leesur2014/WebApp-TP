'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var passport = require('passport');

var app = express();

var api = require('./routes/api');
var users = require('./routes/users');

var server = app.listen(process.env.PORT || 3000);
var sio = require('./sio')(server);

var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var sessionMiddleware = session({
    store: new RedisStore({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
});

app.use(logger('dev'));

// NOTE: remove in production code
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(sessionMiddleware);

app.use(bodyParser.urlencoded({extended: false}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);
app.use('/api', api);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      code: -1
    });
});



module.exports = app;
