const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: String,
  code: String, // Added field for code
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: false,
    default: " ",
  },
  code: {
    type: String,
    required: false,
    default: " ",
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: [commentSchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ForumPost', forumPostSchema);
