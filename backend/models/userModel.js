const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      min: 6,
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/dmomqi39j/image/upload/v1706269976/avatar/avatar-default-icon_pydzwj.png',
    },
    streaks: {
      type: Number,
      default: 0,
    },
    lastSubmissionDate: {
      type: Date,
      default: null,
    },
    submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
    points: { 
      type: Number, 
      default: 0 
    },
    highestScores: [{
      problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
      score: { type: Number }
    }],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user' 
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
