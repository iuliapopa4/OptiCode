const Solution = require('../models/solutionModel');

const solutionController = {
  proposeSolution: async (req, res) => {
    const { problemId, solution, userId } = req.body;
    try {
      const newSolution = await Solution.create({ problemId, solution, userId });
      res.status(201).json(newSolution);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  getProposedSolutions: async (req, res) => {
    try {
      const solutions = await Solution.find({ problemId: req.params.problemId }).populate('userId', 'name');
      res.json(solutions);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },
};

module.exports = solutionController;
