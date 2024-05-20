const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  text: {
    type: String,
    required: [true, 'Problem statement is required'],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'], 
    required: true,
  },
  code: {
    type: String,
    required: false,
    default: "" 
  },
  tags: [{ type: String }],
  createdAt: { 
    type: Date,
    default: Date.now,
  },
  updatedAt: { 
    type: Date,
    default: Date.now,
  },
  test_list: [{ type: String }]
});

module.exports = mongoose.model('Problem', problemSchema);
