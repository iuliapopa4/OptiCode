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
  result: { 
    type: String, 
    required: true 
  }, 
  testCasesPassed: { 
    type: Number, 
    required: true 
  },
  totalTestCases: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
