const sendMail = require("../helpers/sendMail");
const createToken = require("../helpers/createToken");
const validateEmail = require("../helpers/validateEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Problem = require('../models/problemModel');
const Submission = require('../models/submissionModel'); 

const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password)
        return res.status(400).json({ msg: "Please fill in all fields." });

      if (!validateEmail(email))
        return res.status(400).json({ msg: "Please enter a valid email address." });

      const user = await User.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "This email is already registered in our system." });

      if (password.length < 6)
        return res.status(400).json({ msg: "Password must be at least 6 characters." });

      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = { name, email, password: hashPassword };
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

      const check = await User.findOne({ email });
      if (check)
        return res.status(400).json({ msg: "This email is already registered." });

      const newUser = new User({ name, email, password });
      await newUser.save();

      res.status(200).json({ msg: "Your account has been activated, you can now sign in." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  signing: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user)
        return res
          .status(400)
          .json({ msg: "This email is not registered in our system." });

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

  access: async (req, res) => {
    try {
      const rf_token = req.cookies._apprftoken;
      if (!rf_token) return res.status(400).json({ msg: "Please sign in." });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please sign in again." });
        const ac_token = createToken.access({ id: user.id });
        return res.status(200).json({ ac_token });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Email reset link on user request
  forgot: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user)
        return res
          .status(400)
          .json({ msg: "This email is not registered in our system." });

      const ac_token = createToken.access({ id: user.id });

      const url = `http://localhost:3000/auth/reset-password/${ac_token}`;
      const name = user.name;
      sendMail.sendEmailReset(email, url, "Reset your password", name);

      res
        .status(200)
        .json({ msg: "Re-send the password, please check your email." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Update password
  reset: async (req, res) => {
    try {
      const { password } = req.body;

      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);

      await User.findOneAndUpdate({ _id: req.user.id },{ password: hashPassword });

      res.status(200).json({ msg: "Password was updated successfully." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Fetch user details, without password
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

      await User.findOneAndUpdate({ _id: req.user.id }, { name, avatar });
      res.status(200).json({ msg: "Update success." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  signout: async (req, res) => {
    try {
      // Clear authentication token to effectively log out the user
      res.clearCookie("_apprftoken", { path: "/api/auth/access" });
      return res.status(200).json({ msg: "Signout success." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  updateUserPoints: async (userId, problemId, newScore) => {
    try {
      const user = await User.findById(userId);
      const problem = await Problem.findById(problemId);

      if (!user || !problem) {
        throw new Error('User or Problem not found');
      }

      newScore = parseFloat(newScore.toFixed(2)); // Ensure newScore is a floating-point number with 2 decimal places
      let points = newScore;

      if (problem.difficulty === 'medium') {
        points *= 2;
      } else if (problem.difficulty === 'hard') {
        points *= 3;
      }

      points = parseFloat(points.toFixed(2)); // Ensure points is a floating-point number with 2 decimal places

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

      user.points = parseFloat(user.points.toFixed(2)); // Ensure user.points is a floating-point number with 2 decimal places

      await user.save();
      return user.points;
    } catch (error) {
      console.error('Error updating user points:', error);
      throw error;
    }
  },
  
  getUserProfile : async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('-password')
        .populate('submissions');
  
      if (!user) {
        console.error('User not found');
        return res.status(404).json({ error: 'User not found' });
      }
  
      console.log(`User found: ${user.name}`);
      console.log(`User submissions: ${JSON.stringify(user.submissions, null, 2)}`);
  
      // Set to store unique problem IDs with 100% score
      const solvedProblemsSet = new Set();
  
      // Iterate through submissions to count solved problems
      user.submissions.forEach(submission => {
        console.log(`Checking submission: ${submission.problemId} with score ${submission.score}`);
        if (submission.score === '100%') {
          solvedProblemsSet.add(submission.problemId.toString());
        }
      });
  
      // Number of unique solved problems
      const solvedProblems = solvedProblemsSet.size;
  
      // Print the solved problems for debugging
      console.log(`User has solved the following problems: ${Array.from(solvedProblemsSet).join(', ')}`);
      console.log(`Total solved problems: ${solvedProblems}`);
  
      res.status(200).json({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        points: user.points,
        solvedProblems,
        submissions: user.submissions
      });
    } catch (error) {
      console.error(`Error fetching user profile: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  getLeaderboard: async (req, res) => {
    try {
      const users = await User.find().sort({ points: -1 }).select('name points').limit(10);
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  },

  checkStreaks: async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastSubmissionDate = user.lastSubmissionDate ? new Date(user.lastSubmissionDate) : null;

        console.log('Today:', today);
        console.log('Yesterday:', yesterday);
        console.log('User\'s last submission date:', lastSubmissionDate);

        if (!lastSubmissionDate || (lastSubmissionDate < yesterday)) {
            // If the last submission was not yesterday or today, reset the streak to 0
            user.streaks = 0;
        } else if (lastSubmissionDate >= yesterday && lastSubmissionDate < today) {
            // If the last submission was yesterday, keep the streak count
            // This case is already handled by the current streak value
        } else if (lastSubmissionDate >= today) {
            // If the last submission was today, increment the streak count if it was already correct yesterday
            user.streaks = (user.streaks > 0) ? user.streaks : 1;
        }

        await user.save();
        res.json({ message: 'Streaks checked and updated if necessary', streaks: user.streaks });
    } catch (error) {
        console.error('Error checking streaks:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
},
  
};

module.exports = userController;
