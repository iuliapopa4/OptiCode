const Problem = require('../models/problemModel');

const problemController = {
  createProblem: async (req, res) => {
    const { id, title, statement, inputFormat, outputFormat, constraints, examples, difficulty, tags, timeLimit, memoryLimit, hints } = req.body;
    
    try {
        const newProblem = await Problem.create({
            id, title, statement, inputFormat, outputFormat, constraints, examples, difficulty, tags, timeLimit, memoryLimit, hints
        });
        res.status(201).json(newProblem);
    } catch (error) {
        console.error(error);
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

  getProblemById: async (req, res) => {
    try {
      const problem = await Problem.findOne({ id: req.params.id });
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(problem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },
  getProblemExamplesById: async (req, res) => {
    try {
      const { id } = req.params;
      const problem = await Problem.findById(id);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      const examples = problem.examples;
      res.json(examples);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },
  

  updateProblemById: async (req, res) => {
    try {
      const updatedProblem = await Problem.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      if (!updatedProblem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(updatedProblem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  deleteProblemById: async (req, res) => {
    try {
      const deletedProblem = await Problem.findOneAndDelete({ id: req.params.id });
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
