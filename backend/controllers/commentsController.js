const Comment = require('../models/commentsModel');
const Problem = require('../models/problemModel');

const commentController = {
  addComment: async (req, res) => {
    try {
      const { id: problemId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;

      if (!text.trim()) {
        return res.status(400).json({ error: 'Comment cannot be empty.' });
      }

      const problem = await Problem.findOne({ id: problemId });
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const comment = await Comment.create({
        userId,
        problemId: problem._id,
        text
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: error.toString() });
    }
  },

  getComments: async (req, res) => {
    try {
      const { id: problemId } = req.params;
      const problem = await Problem.findOne({ id: problemId });

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const comments = await Comment.find({ problemId: problem._id }).populate('userId', 'username').sort({ createdAt: -1 });

      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: error.toString() });
    }
  }
};

module.exports = commentController;
