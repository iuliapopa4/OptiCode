const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require("../middlewares/auth");

router.post('/submitCode/:id', auth, submissionController.submitCode);
router.get('/submissions/:userId/:problemId', auth, submissionController.getUserSubmissionsForProblem);
router.get('/subm/:submissionId', auth, submissionController.getSubmissionDetails);
router.get('/subUser/:userId', auth, submissionController.getUserSubmissions);
  

module.exports = router;
