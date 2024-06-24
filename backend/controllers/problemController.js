const Problem = require('../models/problemModel');
const SuggestedProblem = require('../models/suggestedProblemModel');
const User = require('../models/userModel');  

const problemController = {
  // Suggest a new problem
  suggestProblem : async (req, res) => {
    const { title, description, difficulty, code, testCases } = req.body;
    const { user } = req;
  
    try {
      const newSuggestion = new SuggestedProblem({
        title,
        description,
        difficulty,
        code,
        testCases,
        suggestedBy: user._id
      });
      await newSuggestion.save();
      res.status(201).json(newSuggestion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

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

  // Get a random unsolved problem for the user
  getRandomUnsolvedProblem: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).populate('solvedProblems');
      const solvedProblemIds = user.solvedProblems.map(problem => problem._id);

      const unsolvedProblems = await Problem.find({ _id: { $nin: solvedProblemIds } });

      if (unsolvedProblems.length === 0) {
        return res.status(404).json({ message: 'No unsolved problems available.' });
      }

      const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
      const randomUnsolvedProblem = unsolvedProblems[randomIndex];

      res.status(200).json(randomUnsolvedProblem);
    } catch (error) {
      console.error('Error fetching random unsolved problem:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

};

module.exports = problemController;
