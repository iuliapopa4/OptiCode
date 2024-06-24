const User = require('../models/userModel');

// Middleware function to check if the user is an admin
const isAdmin = async (req, res, next) => {
  try {
    // Find the user by ID from the request object
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    // Log user role for debugging purposes
    console.log(`User role: ${user.role}`);

    // Check if the user role is 'admin'
    if (user.role !== 'admin') return res.status(403).json({ msg: 'Access denied, admin only.' });

    // If the user is an admin, proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle any errors that occur
    res.status(500).json({ msg: err.message });
  }
};

module.exports = isAdmin;
