const Problem = require('../models/problemModel');

const problemController = {
  createProblem: async (req, res) => {
    const { title, statement, difficulty, code, test_list } = req.body;

    try {
      // Calculate the new problem ID based on the current count of problems
      const lastProblem = await Problem.findOne().sort({ id: -1 });
      const newId = lastProblem ? lastProblem.id + 1 : 1;

      console.log('New Problem ID:', newId);
      console.log('Request Body:', req.body);

      const newProblem = await Problem.create({
        id: newId,
        title,
        text: statement,
        difficulty,
        code,
        test_list
      });
      
      console.log('New Problem Created:', newProblem);
      res.status(201).json(newProblem);
    } catch (error) {
      console.error('Error creating problem:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  getAllProblems: async (req, res) => {
    try {
      const problems = await Problem.find({});
      res.json(problems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },
  getTotalProblems: async (req, res) => {
    try {
      const totalProblems = await Problem.countDocuments();
      res.json({ totalProblems });
    } catch (error) {
      console.error('Error fetching total problems:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getProblemById: async (req, res) => {
    try {
      const problem = await Problem.findOne({ id: req.params.id });
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(problem);
    } catch (error) {
      console.error('Error fetching problem by ID:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },
  getProblemByObjectId: async (req, res) => {
    try {
      const problem = await Problem.findById(req.params.id);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(problem);
    } catch (error) {
      console.error('Error fetching problem by Object ID:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  updateProblemField: async (req, res) => {
    try {
      const { field, value } = req.body;
      const updatedProblem = await Problem.findByIdAndUpdate(
        req.params.id,
        { [field]: value },
        { new: true }
      );
      if (!updatedProblem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(updatedProblem);
    } catch (error) {
      console.error('Error updating problem field:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  deleteProblemByObjectId: async (req, res) => {
    try {
      const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
      if (!deletedProblem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json({ message: 'Problem deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },
};

module.exports = problemController;
