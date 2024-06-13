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


router.post('/suggestProblem', auth, problemController.suggestProblem);

// Admin routes
router.post('/createProblem', auth, isAdmin, problemController.createProblem);
router.patch('/updateProblemField/:id', problemController.updateProblemField); 
router.delete('/deleteProblem/:id', auth, isAdmin, problemController.deleteProblemByObjectId);

module.exports = router;
