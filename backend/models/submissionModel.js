const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  problemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Problem' 
  },
  language: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, 
    required: true 
  },
  score: { 
    type: String, 
  },
  result: {
    type: String,
  },
  passedTests: {
    type: Number,
  },
  totalTests: {
    type: Number,
  },
  testResults: [{
    testCase: String,
    passed: Boolean,
    errorMessage: String
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
