const SuggestedProblem = require('../models/suggestedProblemModel');
const Problem = require('../models/problemModel');

// Suggest a new problem
const suggestProblem = async (req, res) => {
  try {
    const { title, description, difficulty, code } = req.body;
    const newSuggestedProblem = new SuggestedProblem({
      title,
      description,
      difficulty,
      code,
      suggestedBy: req.user._id
    });
    await newSuggestedProblem.save();
    res.status(201).json(newSuggestedProblem);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all suggested problems (for admin)
const getAllSuggestedProblems = async (req, res) => {
  try {
    const suggestions = await SuggestedProblem.find().populate('suggestedBy', 'name');
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get a specific suggested problem by ID (for admin)
const getSuggestedProblemById = async (req, res) => {
  try {
    const suggestedProblem = await SuggestedProblem.findById(req.params.id).populate('suggestedBy', 'name');
    if (!suggestedProblem) {
      return res.status(404).json({ msg: 'Suggested problem not found.' });
    }
    res.status(200).json(suggestedProblem);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update the status of a suggested problem (approve/reject) and add test cases
const updateSuggestedProblemStatus = async (req, res) => {
  try {
    const { title, description, difficulty, testCases, status } = req.body;
    const suggestedProblem = await SuggestedProblem.findById(req.params.id);
    if (!suggestedProblem) return res.status(404).json({ msg: 'Suggested problem not found.' });

    if (title) suggestedProblem.title = title;
    if (description) suggestedProblem.description = description;
    if (difficulty) suggestedProblem.difficulty = difficulty;
    if (Array.isArray(testCases)) suggestedProblem.testCases = testCases;
    if (status) suggestedProblem.status = status;

    if (status === 'approved') {
      const lastProblem = await Problem.findOne().sort({ id: -1 });
      const newId = lastProblem ? lastProblem.id + 1 : 1;

      const newProblem = new Problem({
        id: newId,
        title: suggestedProblem.title,
        text: suggestedProblem.description,
        difficulty: suggestedProblem.difficulty,
        code: suggestedProblem.code,
        test_list: testCases
      });
      await newProblem.save();
    }
    await suggestedProblem.save();

    res.status(200).json(suggestedProblem);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  suggestProblem,
  getAllSuggestedProblems,
  getSuggestedProblemById,
  updateSuggestedProblemStatus
};
