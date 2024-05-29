const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

router.get('/admin-only', auth, isAdmin, (req, res) => {
  res.status(200).json({ msg: 'Welcome, admin!' });
});

module.exports = router;
