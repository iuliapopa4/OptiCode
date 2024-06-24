const Solution = require('../models/solutionModel');
const Submission = require('../models/submissionModel');
const Problem = require('../models/problemModel');

exports.submitSolution = async (req, res) => {
  const { problemId, code } = req.body;
  const { user } = req;

  try {
    // Evaluate submission and calculate score
    const score = evaluateSubmission(problemId, code); 

    // Save the submission
    const newSubmission = new Submission({
      problemId,
      userId: user._id,
      code,
      score,
      createdAt: new Date(),
    });
    await newSubmission.save();

    res.status(201).json(newSubmission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
