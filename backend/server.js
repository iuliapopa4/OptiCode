const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { PythonShell } = require('python-shell');

// Load environment variables from .env file
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {});
const db = mongoose.connection;

db.on('error', (error) => {
    console.error('db error:', error);
});

// Once connected to MongoDB, start the server
db.once('open', () => {
    console.log('db connected');
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log('server is running on port', PORT);
    });
});

// HTTP headers for security
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Middleware for parsing JSON, urlencoded data and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session management middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/api', require('./helpers/compiler'));
app.use('/api', require('./routes/problemRoutes'));
app.use('/api', require('./routes/submissionRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/uploadRoutes'));
app.use('/api', require('./routes/astRoute'));
app.use('/api', require('./routes/solutionRoutes'));
app.use('/api', require('./routes/adminRoutes')); 
app.use('/api', require('./routes/suggestedProblemRoutes'));

// Route for analyzing code
app.post('/analyze-code', (req, res) => {
  const { code } = req.body;

  // Save the code to a file
  const codeFilePath = path.join(__dirname, 'code_to_analyze.py');
  fs.writeFileSync(codeFilePath, code);

  // Run the AST analysis script
  let options = {
      scriptPath: __dirname,
      args: [codeFilePath]
  };

  PythonShell.run('analyze_code.py', options, (err, results) => {
      if (err) {
          console.error(`Error: ${err}`);
          return res.status(500).json({ error: 'Analysis failed' });
      }
      res.json({ feedback: results.join('\n') });
  });
});

module.exports = app;
