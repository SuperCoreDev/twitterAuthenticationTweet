require('dotenv').config();

var express = require('express');
var passport = require('passport');
var path = require('path');
var cookieParser = require('cookie-parser');
var actionRouter = require('./routes/action');
var app = express();

require('./boot/action')();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Set backend action router
app.use('/', actionRouter);

// add middlewares
// app.use(express.static(path.join(__dirname, '..', 'build')));
app.use(express.static('public'));

// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
// });

module.exports = app;
