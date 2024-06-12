const Submission = require('../models/submissionModel');
const Problem = require('../models/problemModel');
const User = require('../models/userModel');
const { evaluateSolution } = require('../helpers/evaluateSolution');
const { updateUserPoints } = require('../controllers/userController');
const mongoose = require('mongoose');

const submissionController = {
  submitCode: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id: problemId } = req.params;
      const { code, language } = req.body;

      if (!code.trim()) {
        return res.status(400).json({ error: 'Code cannot be empty.' });
      }

      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID format' });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const evaluation = await evaluateSolution(code, problemId);
      const { score, totalTests, passedTests, testResults } = evaluation;

      const result = `Score: ${score.toFixed(2)}%\nPassed ${passedTests} out of ${totalTests} tests.`;

      const submission = await Submission.create({
        userId,
        problemId,
        language,
        code,
        score: `${score.toFixed(2)}%`,
        passedTests,
        totalTests,
        result,
        testResults,
        createdAt: new Date()
      });

      // Update user's streaks and last submission date
      const user = await User.findById(userId);
      const today = new Date().setUTCHours(0, 0, 0, 0);
      const lastSubmissionDate = user.lastSubmissionDate ? new Date(user.lastSubmissionDate).setUTCHours(0, 0, 0, 0) : null;

      if (lastSubmissionDate && lastSubmissionDate === today - 86400000) {
        user.streaks += 1;
      } else if (lastSubmissionDate !== today) {
        user.streaks = 1;
      }

      if (user.streaks > user.maxStreak) {
        user.maxStreak = user.streaks;
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
