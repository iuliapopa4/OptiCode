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
  statement: {
    type: String,
    required: [true, 'Problem statement is required'],
  },
  inputFormat: {
    type: String,
    required: [true, 'Input format is required'],
  },
  outputFormat: {
    type: String,
    required: [true, 'Output format is required'],
  },
  constraints: {
    type: String,
    required: [true, 'Constraints are required'],
  },
  examples: [{
    input: { type: String, required: [true, 'Example input is required'] },
    output: { type: String, required: [true, 'Example output is required'] }
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'], 
    required: true,
  },
  solution: {
    type: String,
    required: false,
    default: "" 
  },
  tags: [{ type: String }], 
  timeLimit: {
    type: Number,
    required: true,
  },
  memoryLimit: {
    type: Number, 
    required: true,
  },
  hints: [String],
  createdAt: { 
    type: Date,
    default: Date.now,
  },
  updatedAt: { 
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Problem', problemSchema);;
