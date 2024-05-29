const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) return res.status(400).json({ msg: 'Authentication failed.' });

    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
      if (err) return res.status(400).json({ msg: 'Authentication failed.' });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ msg: 'User not found.' });

      req.user = user;
      console.log(`User authenticated: ${JSON.stringify(user)}`); // Log user information
      next();
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;
