const express = require('express');
const router = express.Router();
const solutionController = require('../controllers/solutionController');
const auth = require('../middlewares/auth');

router.post('/proposeSolution', auth, solutionController.proposeSolution);
router.get('/getProposedSolutions/:problemId', auth, solutionController.getProposedSolutions);

module.exports = router;
