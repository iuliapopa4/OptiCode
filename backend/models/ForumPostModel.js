const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: String,
  code: String,
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
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: false,
  },
  type: {
    type: String,
    enum: ['general', 'help'],
    default: 'general'
  },
  comments: [commentSchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ForumPost', forumPostSchema);
