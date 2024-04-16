const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require("../middlewares/auth");

router.post('/submitCode/:id',auth, submissionController.submitCode);
router.get('/submissions/:userId/:problemId', auth, submissionController.getUserSubmissionsForProblem);
router.get('/submissions/:submissionId', auth, submissionController.getSubmissionDetails);

module.exports = router;
