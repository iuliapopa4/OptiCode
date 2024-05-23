const Submission = require('../models/submissionModel');
const Problem = require('../models/problemModel');
const User = require('../models/userModel'); // Ensure User model is imported
const { evaluateSolution } = require('../helpers/evaluateSolution');
const { updateUserPoints } = require('../controllers/userController'); // Ensure updateUserPoints is imported
const mongoose = require('mongoose');

const submissionController = {
  submitCode: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id: problemId } = req.params;
      const { code, language } = req.body;

      if (!code.trim()) {
        console.error('Code is empty');
        return res.status(400).json({ error: 'Code cannot be empty.' });
      }

      console.log('Received data:', { userId, problemId, code, language });

      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        console.error('Invalid problem ID format:', problemId);
        return res.status(400).json({ error: 'Invalid problem ID format' });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        console.error('Problem not found with ID:', problemId);
        return res.status(404).json({ error: 'Problem not found' });
      }

      console.log('Evaluating solution for problem:', problem);

      const evaluation = await evaluateSolution(code, problemId);
      const { score, totalTests, passedTests } = evaluation;

      console.log('Evaluation result:', evaluation);

      const result = `Score: ${score}%\nPassed ${passedTests} out of ${totalTests} tests.`;

      const submission = await Submission.create({
        userId,
        problemId,
        language,
        code,
        score: `${score}%`,
        passedTests,
        totalTests,
        result,
        createdAt: new Date()
      });

      // Update user's streaks and last submission date
      const user = await User.findById(userId);
      const today = new Date().setHours(0, 0, 0, 0);
      const lastSubmissionDate = user.lastSubmissionDate ? new Date(user.lastSubmissionDate).setHours(0, 0, 0, 0) : null;

      if (lastSubmissionDate && lastSubmissionDate === today - 86400000) {
        // If the last submission was yesterday, increment the streak
        user.streaks += 1;
      } else if (lastSubmissionDate !== today) {
        // If the last submission was not today, reset the streak to 1
        user.streaks = 1;
      }

      user.lastSubmissionDate = new Date();
      await updateUserPoints(userId, problemId, score);
      await user.save();

      res.status(201).json({ submission, evaluation });
    } catch (error) {
      console.error('Error handling submission:', error);
      res.status(500).json({ error: error.toString() });
    }
  },

  getUserSubmissionsForProblem: async (req, res) => {
    try {
      const { userId, problemId } = req.params;
      const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getSubmissionDetails: async (req, res) => {
    try {
      const { submissionId } = req.params;

      const submission = await Submission.findById(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      if (submission.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to view this submission" });
      }

      res.json(submission);
    } catch (error) {
      console.error('Error fetching submission details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
 getUserSubmissions: async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('getUserSubmissions - Received userId:', userId);

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('Invalid user ID format:', userId);
        return res.status(400).json({ error: 'Invalid user ID format' });
      }

      const objectId = new mongoose.Types.ObjectId(userId);
      console.log('getUserSubmissions - Converted ObjectId:', objectId);

      const submissions = await Submission.find({ userId: objectId }).sort({ createdAt: -1 });
      console.log('Submissions:', submissions);

      // Get a list of unique problems attempted
      const uniqueProblems = Array.from(new Set(submissions.map(submission => submission.problemId.toString())));
      const problems = await Problem.find({ _id: { $in: uniqueProblems } });

      res.status(200).json({ submissions, solvedProblemsCount: uniqueProblems.length, problems });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

};

module.exports = submissionController;
