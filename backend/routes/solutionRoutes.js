const express = require('express');
const router = express.Router();
const Solution = require('../models/solutionModel');
const auth = require('../middlewares/auth');

// Route to share a solution
router.post('/solutions/shareSolution', auth, async (req, res) => {
  const { problemId, code } = req.body;
  const { user } = req;

  try {
    // Create a new solution document
    const newSolution = new Solution({
      problemId,
      userId: user._id,
      code,
      createdAt: new Date()
    });

    // Save the solution to the database
    await newSolution.save();
    res.status(201).json(newSolution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to view shared solutions for a specific problem
router.get('/solutions/:problemId', auth, async (req, res) => {
  const { problemId } = req.params;

  try {
    // Find solutions for the given problem ID and populate the user information
    const solutions = await Solution.find({ problemId }).populate('userId', 'name');
    res.status(200).json(solutions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
