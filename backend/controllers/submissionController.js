const Submission = require('../models/submissionModel');

const submissionController = {
  submitCode: async (req, res) => {
    try {
      const userId = req.user.id; 
      const { id: problemId } = req.params; 
      const { code, language, result, testCasesPassed, totalTestCases } = req.body;  

      if (!code.trim()) {
        // Validate that code is not empty
        return res.status(400).json({ error: 'Code cannot be empty.' });
      }

      // Create a new submission record in the database
      const submission = await Submission.create({
        userId,
        problemId,
        language,
        code,
        result,
        testCasesPassed,
        totalTestCases
      });

      res.status(201).json(submission);  // Respond with the newly created submission
    } catch (error) {
      console.error('Error handling submission:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },


  getUserSubmissionsForProblem: async (req, res) => {
    try {
      const { userId, problemId } = req.params; 
      const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });  // Find and sort submissions
      res.json(submissions);  // Respond with the list of submissions
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
        // Check if the submission exists
        return res.status(404).json({ message: "Submission not found" });
      }

      if (submission.userId.toString() !== req.user.id) {
        // Check if the current user is the owner of the submission
        return res.status(403).json({ message: "You do not have permission to view this submission" });
      }

      res.json(submission);  // Respond with the submission details
    } catch (error) {
      console.error('Error fetching submission details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
};

module.exports = submissionController;
