const User = require('../models/userModel');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    console.log(`User role: ${user.role}`); // Log user role
    if (user.role !== 'admin') return res.status(403).json({ msg: 'Access denied, admin only.' });
    next();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = isAdmin;
