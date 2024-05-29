const express = require('express');
const route = express.Router();
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const suggestedProblemController = require('../controllers/suggestedProblemController');

route.get('/suggested-problems', auth, isAdmin, suggestedProblemController.getAllSuggestedProblems);
route.get('/suggested-problems/:id', auth, isAdmin, suggestedProblemController.getSuggestedProblemById);
route.put('/update-suggested-problems/:id', auth, isAdmin, suggestedProblemController.updateSuggestedProblemStatus);

module.exports = route;
