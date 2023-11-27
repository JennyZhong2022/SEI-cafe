const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
// Always require and configure near the top
require('dotenv').config();
// Connect to the database
require('./config/database');
require('./config/passport')

const app = express();

app.use(logger('dev'));
app.use(express.json());

// Configure both serve-favicon & static middleware
// to serve from the production 'build' folder
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'build', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'build')));


app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use(function(req, res, next) {
  next(createError(404));
});

// Middleware to check and verify a JWT and
// assign the user object from the JWT to req.user
app.use(require('./config/checkToken'));

const port = process.env.PORT || 3001;

// Put API routes here, before the "catch all" route
app.use('/auth', require('./routes/googleAuth/auth'));


app.use('/api/users', require('./routes/api/users'));


// Protect all routes below from anonymous users
const ensureLoggedIn = require('./config/ensureLoggedIn');


const ensureLoggedInGoogleAuth = require('./config/ensureLoggedInGoogleAuth');

// Combined middleware for /api/items route
const ensureAnyAuth = (req, res, next) => {
  ensureLoggedIn(req, res, (err) => {
    if (err || req.user) {
      // If there's an error or user is authenticated by JWT, proceed
      return next(err);
    }
    // Try Google Auth
    ensureLoggedInGoogleAuth(req, res, next);
  });
};

app.use('/api/items', ensureAnyAuth, require('./routes/api/items'));

// The following "catch all" route (note the *) is necessary
// to return the index.html on all non-AJAX/API requests
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, function() {
  console.log(`Express app running on port ${port}`);
});
