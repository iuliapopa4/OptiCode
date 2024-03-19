const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  statement: {
    type: String,
    required: true,
  },
  inputFormat: String,
  outputFormat: String,
  constraints: String,
  examples: [
    {
      input: String,
      output: String,
    },
  ],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'difficult'],
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
  timeLimit: {
    type: Number,
    required: true,
  },
  memoryLimit: {
    type: Number, 
    required: true,
  },
  hints: [String],
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
