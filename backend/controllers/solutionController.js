const Solution = require('../models/solutionModel');
const Submission = require('../models/submissionModel');
const Problem = require('../models/problemModel');

// Assuming you have a method to handle submissions
exports.submitSolution = async (req, res) => {
  const { problemId, code } = req.body;
  const { user } = req;

  try {
    // Evaluate submission and calculate score
    const score = evaluateSubmission(problemId, code); // Implement your own evaluation logic

    // Save the submission
    const newSubmission = new Submission({
      problemId,
      userId: user._id,
      code,
      score,
      createdAt: new Date(),
    });
    await newSubmission.save();

    // // If the score is 100%, allow the user to share their solution
    // if (score === 100) {
    //   const existingSolution = await Solution.findOne({ problemId, userId: user._id });
    //   if (!existingSolution) {
    //     const newSolution = new Solution({
    //       problemId,
    //       userId: user._id,
    //       code,
    //     });
    //     await newSolution.save();
    //   }
    // }

    res.status(201).json(newSubmission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
