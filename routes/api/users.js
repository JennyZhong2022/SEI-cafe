const express = require('express');
const router = express.Router();
const passport = require('passport');
const usersCtrl = require('../../controllers/api/users');

// All paths start with '/api/users'

// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  { failureRedirect: '/' }
), usersCtrl.googleOAuth); // Use the googleOAuth function

// POST /api/users (create a user - sign up)
router.post('/', usersCtrl.create);
// POST /api/users/login
router.post('/login', usersCtrl.login);



module.exports = router;