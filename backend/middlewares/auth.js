const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware function for authentication
const auth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.header('Authorization');
    if (!token) return res.status(400).json({ msg: 'Authentication failed.' });

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
      if (err) return res.status(400).json({ msg: 'Authentication failed.' });

      // Find the user by decoded token ID
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ msg: 'User not found.' });

      // Attach user information to the request object
      req.user = user;
      console.log(`User authenticated: ${JSON.stringify(user)}`); // Log user information
      next();
    });
  } catch (err) {
    // Handle any errors that occur
    res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;
