const Submission = require('../models/submissionModel');

exports.submitCode = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { id: problemId } = req.params;
    const { code } = req.body;

    if (!code.trim()) {
      return res.status(400).json({ error: 'Code cannot be empty.' });
    }

    const submission = await Submission.create({
      userId,
      problemId,
      code,
      result: 'pending', 
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Error handling submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
