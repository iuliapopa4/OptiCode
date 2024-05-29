const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// Public routes
router.get('/getProblems', problemController.getAllProblems);
router.get('/getProblem/:id', problemController.getProblemById);
router.get('/getProblemByObjectId/:id', problemController.getProblemByObjectId);
router.get('/totalProblems', problemController.getTotalProblems);

// Admin routes
router.post('/createProblem', auth, isAdmin, problemController.createProblem);
router.put('/updateProblem/:id', auth, isAdmin, problemController.updateProblemById);
router.delete('/deleteProblem/:id', auth, isAdmin, problemController.deleteProblemById);

module.exports = router;
