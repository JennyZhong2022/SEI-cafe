const express = require('express');
const router = express.Router();
const passport = require('passport');
const usersCtrl = require('../../controllers/api/users');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/orders/new');
});

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  // Which passport strategy is being used?
  'google',
  {
    // Requesting the user's profile and email
    scope: ['profile', 'email'],
    // Optionally force pick account every time
    // prompt: "select_account"
    prompt:'select_account'
  }
));

// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect: '/orders/new',
    failureRedirect: '/'
  }
), usersCtrl.googleOAuth );

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout(function() {
    res.redirect('/');
  });
});

module.exports = router;