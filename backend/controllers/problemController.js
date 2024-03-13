const Problem = require('../models/problemModel');

const problemController = {
createProblem: async (req, res) => {
    const { title, statement, inputFormat, outputFormat, constraints, examples, difficulty, solution } = req.body;
    try {
      const newProblem = await Problem.create({
        title,
        statement,
        inputFormat,
        outputFormat,
        constraints,
        examples,
        difficulty,
        solution,
      });
      res.status(201).json(newProblem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

getAllProblems: async (req, res) => {
    try {
      const problems = await Problem.find();
      res.json(problems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

getProblemById: async (req, res) => {
    const { id } = req.params; 
    try {
        const problem = await Problem.findById(id); 
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.json(problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
},
updateProblemById: async (req, res) => {
    const { id } = req.params;
    const { title, statement, inputFormat, outputFormat, constraints, examples, difficulty, solution } = req.body;
    try {
      const updatedProblem = await Problem.findByIdAndUpdate(
        id,
        {
          title,
          statement,
          inputFormat,
          outputFormat,
          constraints,
          examples,
          difficulty,
          solution,
        },
        { new: true }
      );
      if (!updatedProblem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(updatedProblem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

deleteProblemById: async (req, res) => {
    const { id } = req.params;
    try {
      const deletedProblem = await Problem.findByIdAndDelete(id);
      if (!deletedProblem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json({ message: 'Problem deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  getTestInputById: async (req, res) => {
    const { id } = req.params;
    try {
      const problem = await Problem.findById(id);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Extract the first test input from the examples array
      const firstTestInput = problem.examples[0]?.input;

      if (!firstTestInput) {
        return res.status(404).json({ error: 'Test input not found for the problem' });
      }

      res.json({ testInput: firstTestInput });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = problemController;
