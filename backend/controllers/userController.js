const sendMail = require("../helpers/sendMail");
const createToken = require("../helpers/createToken");
const validateEmail = require("../helpers/validateEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Submission = require('../models/submissionModel'); 
const Problem = require('../models/problemModel'); 

// Function to calculate user level based on points
const calculateLevel = (points) => {
  const level = Math.floor(0.1 * Math.sqrt(points));
  const nextLevel = level + 1;
  const pointsForNextLevel = Math.pow(nextLevel / 0.1, 2);
  const pointsNeeded = pointsForNextLevel - points;
  return { level, pointsNeeded };
};

const userController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input fields
      if (!name || !email || !password)
        return res.status(400).json({ msg: "Please fill in all fields." });

      // Validate email format
      if (!validateEmail(email))
        return res.status(400).json({ msg: "Please enter a valid email address." });

      // Check if user already exists
      const user = await User.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "This email is already registered in our system." });

      // Validate password length
      if (password.length < 6)
        return res.status(400).json({ msg: "Password must be at least 6 characters." });

      // Hash password and create new user
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      const newUser = { name, email, password: hashPassword };

      // Create activation token and send activation email
      const activation_token = createToken.activation(newUser);
      const url = `http://localhost:3000/api/auth/activate/${activation_token}`;
      sendMail.sendEmailRegister(email, url, "Verify your email");

      res.status(200).json({ msg: "Welcome! Please check your email." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Activate user account from the verification link
  activate: async (req, res) => {
    try {
      const { activation_token } = req.body;
      
      // Token verification 
      const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN);
      const { name, email, password } = user;

      // Check if user already exists
      const check = await User.findOne({ email });
      if (check)
        return res.status(400).json({ msg: "This email is already registered." });

      // Save new user to the database
      const newUser = new User({ name, email, password });
      await newUser.save();

      res.status(200).json({ msg: "Your account has been activated, you can now sign in." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // User sign in
  signing: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ msg: "This email is not registered in our system." });

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "This password is incorrect." });

      // Generate and set a refresh token in HTTP-only cookie for security
      const rf_token = createToken.refresh({ id: user._id });
      res.cookie("_apprftoken", rf_token, {
        httpOnly: true,
        path: "/api/auth/access",
        maxAge: 24 * 60 * 60 * 1000, // Refresh token validity (1 day)
      });

      res.status(200).json({ msg: "Signing success" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Generate access token from refresh token
  access: async (req, res) => {
    try {
      const rf_token = req.cookies._apprftoken;
      if (!rf_token) return res.status(400).json({ msg: "Please sign in." });

      // Verify refresh token
      jwt.verify(rf_token, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please sign in again." });
        const ac_token = createToken.access({ id: user.id });
        return res.status(200).json({ ac_token });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Send password reset email
  forgot: async (req, res) => {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ msg: "This email is not registered in our system." });

      // Generate access token and send reset email
      const ac_token = createToken.access({ id: user.id });
      const url = `http://localhost:3000/auth/reset-password/${ac_token}`;
      const name = user.name;
      sendMail.sendEmailReset(email, url, "Reset your password", name);

      res.status(200).json({ msg: "Re-send the password, please check your email." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Reset user password
  reset: async (req, res) => {
    try {
      const { password } = req.body;

      // Hash new password and update user record
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      await User.findOneAndUpdate({ _id: req.user.id }, { password: hashPassword });

      res.status(200).json({ msg: "Password was updated successfully." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Fetch user details, excluding password
  info: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Update user profile 
  update: async (req, res) => {
    try {
      const { name, avatar } = req.body;

      // Update user record
      await User.findOneAndUpdate({ _id: req.user.id }, { name, avatar });
      res.status(200).json({ msg: "Update success." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // User sign out
  signout: async (req, res) => {
    try {
      // Clear authentication token to effectively log out the user
      res.clearCookie("_apprftoken", { path: "/api/auth/access" });
      return res.status(200).json({ msg: "Signout success." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Update user points and level based on problem score
  updateUserPoints : async (userId, problemId, newScore) => {
    try {
      const user = await User.findById(userId);
      const problem = await Problem.findById(problemId);

      // Check if user or problem exists
      if (!user || !problem) {
        throw new Error('User or Problem not found');
      }

      // Calculate points based on problem difficulty
      newScore = parseFloat(newScore.toFixed(2));
      let points = newScore;

      if (problem.difficulty === 'medium') {
        points *= 2;
      } else if (problem.difficulty === 'hard') {
        points *= 3;
      }

      points = parseFloat(points.toFixed(2));

      // Update user's highest score for the problem
      const existingScore = user.highestScores.find(
        (entry) => entry.problemId.toString() === problemId.toString()
      );

      if (!existingScore) {
        user.highestScores.push({ problemId, score: newScore });
        user.points += points;
      } else {
        const oldPoints = (existingScore.score / 100) * (problem.difficulty === 'medium' ? 200 : problem.difficulty === 'hard' ? 300 : 100);
        user.points -= oldPoints; // Subtract old points
        user.points += points; // Add new points
        existingScore.score = newScore;
      }

      user.points = parseFloat(user.points.toFixed(2));

      // Update user level based on new points
      const { level, pointsNeeded } = calculateLevel(user.points);
      user.level = level;

      // Add problem to solvedProblems if the score is 100
      if (newScore === 100) {
        if (!user.solvedProblems.includes(problemId)) {
          user.solvedProblems.push(problemId);
        }
      }

      await user.save();
      return { points: user.points, level, pointsNeeded };
    } catch (error) {
      console.error('Error updating user points:', error);
      throw error;
    }
  },

  // Fetch user profile details
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password').populate('submissions');

      if (!user) {
        console.error('User not found');
        return res.status(404).json({ error: 'User not found' });
      }

      // Count the number of unique solved problems
      const solvedProblemsSet = new Set();
      user.submissions.forEach(submission => {
        if (submission.score === '100%') {
          solvedProblemsSet.add(submission.problemId.toString());
        }
      });

      const solvedProblems = solvedProblemsSet.size;

      res.status(200).json({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        solvedProblems,
        submissions: user.submissions,
        streaks: user.streaks,
        maxStreak: user.maxStreak,
      });
    } catch (error) {
      console.error(`Error fetching user profile: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  // Fetch top users for leaderboard
  getLeaderboard: async (req, res) => {
    try {
      const users = await User.find({ role: 'user' }).sort({ points: -1 }).select('name points level role').limit(10);
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  // Check and update user streaks
  checkStreaks: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      const today = new Date().setUTCHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastSubmissionDate = user.lastSubmissionDate ? new Date(user.lastSubmissionDate).setUTCHours(0, 0, 0, 0) : null;

      if (!lastSubmissionDate || lastSubmissionDate < yesterday) {
        // Reset streaks if the last submission was not yesterday or today
        user.streaks = 0;
      } else if (lastSubmissionDate === yesterday) {
        // Increment streaks if the last submission was yesterday
        user.streaks += 1;
      }

      if (user.streaks > user.maxStreak) {
        user.maxStreak = user.streaks;
      }

      await user.save();
      res.json({ message: 'Streaks checked and updated if necessary', streaks: user.streaks, maxStreak: user.maxStreak });
    } catch (error) {
      console.error('Error checking streaks:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  // Fetch all users
  getUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password'); // Exclude passwords from the results
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Check if user has a perfect score for a specific problem
  checkPerfectScore: async (req, res) => {
    const { problemId } = req.params;
    const { user } = req;

    try {
      const submission = await Submission.findOne({ problemId, userId: user._id, score: 100 });
      if (submission) {
        return res.status(200).json({ hasPerfectScore: true });
      }
      return res.status(200).json({ hasPerfectScore: false });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

module.exports = userController;
