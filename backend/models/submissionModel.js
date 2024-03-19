const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  result: { type: String, enum: ['accepted', 'wrong answer', 'runtime error', 'time limit exceeded'], required: true },
  score: { type: Number, default: 0 },
  feedback: { type: String },
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
