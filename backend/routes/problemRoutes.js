const express = require('express');
const router = express.Router();
const problemController = require("../controllers/problemController");

router.post('/createProblem', problemController.createProblem);
router.get('/getProblems',problemController.getAllProblems);
router.get('/getProblem/:id',problemController.getProblemById);
router.put('/updateProblem/:id', problemController.updateProblemById);
router.delete('/deleteProblem/:id',problemController.deleteProblemById);
router.get('/totalProblems', problemController.getTotalProblems);
router.get('/getProblemByObjectId/:id', problemController.getProblemByObjectId); 

module.exports = router;
