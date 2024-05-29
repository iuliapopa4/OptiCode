const mongoose = require('mongoose');

const suggestedProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  code: { type: String, default: '' },
  testCases: [{ type: String }]  
}, { timestamps: true });

module.exports = mongoose.model('SuggestedProblem', suggestedProblemSchema);
