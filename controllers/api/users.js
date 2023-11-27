const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');

module.exports = {
  create,
  login,
  googleOAuth,
};

async function create(req, res) {
  try {
    // Add the user to the dbc
    const user = await User.create(req.body);
    // token will be a string
    const token = createJWT(user);
    // Yes, we can serialize a string
    res.json(token);
  } catch (err) {
    // Probably a dup email
    res.status(400).json(err);
  }
}

async function login(req, res) {
  try {
    // Find the user by their email address
    const user = await User.findOne({email: req.body.email});
    if (!user) throw new Error();
    // Check if the password matches
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) throw new Error();
    res.json( createJWT(user) );
  } catch {
    res.status(400).json('Bad Credentials');
  }
}

// New function to handle Google OAuth
async function googleOAuth(req, res) {
  try {
    let user = await User.findOne({ googleId: req.user.googleId });
    if (!user) {
      user = await User.create({
        name: req.user.name,
        email: req.user.email,
        googleId: req.user.googleId,
        avatar: req.user.avatar
      });
    }
    res.json(createJWT(user));
  } catch (err) {
    res.status(400).json(err);
  }
}





/* Helper Functions */

function createJWT(user) {
  return jwt.sign(
    // data payload
    { user },
    process.env.SECRET,
    { expiresIn: '24h' }
  );
}