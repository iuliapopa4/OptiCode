// routes/solutionRoutes.js
const express = require('express');
const router = express.Router();
const Solution = require('../models/solutionModel');
const auth = require('../middlewares/auth');

// Route to share a solution
router.post('/solutions/shareSolution', auth, async (req, res) => {
  const { problemId, code } = req.body;
  const { user } = req;

  try {
    const newSolution = new Solution({
      problemId,
      userId: user._id,
      code,
      createdAt: new Date()
    });

    await newSolution.save();
    res.status(201).json(newSolution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to view shared solutions
router.get('/solutions/:problemId', auth, async (req, res) => {
    const { problemId } = req.params;
  
    try {
      const solutions = await Solution.find({ problemId }).populate('userId', 'name');
      res.status(200).json(solutions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  

module.exports = router;
