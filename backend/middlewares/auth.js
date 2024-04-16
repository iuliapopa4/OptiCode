const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Extract token from request header
    const token = req.header("Authorization");

    // Check if token exists
    if (!token) return res.status(400).json({ msg: "Authentication failed." });

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) return res.status(400).json({ msg: "Authentication failed." });
      // If token is valid, attach user information to request object
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;