const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require("../middlewares/auth");


router.post('/submitCode/:id',auth, submissionController.submitCode);

module.exports = router;
