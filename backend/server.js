const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const analyzeCodeRoute = require('./routes/astRoute');
const solutionRoutes = require('./routes/solutionRoutes');
const compilerRouter = require('./helpers/compiler');
const bodyParser = require('body-parser');
const { PythonShell } = require('python-shell');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(bodyParser.json());

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

// Connect to MongoDB 
mongoose.connect(process.env.DB_URL, {});
const db = mongoose.connection;

db.on('error', (error) => {
    console.error('db error:', error);
});

// Once connected to MongoDB, start the server
db.once('open', () => {
    console.log('db connected');
    const PORT = 8000;  
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
app.use(
  session({
    secret: process.env.SESSION_SECRET,  
    resave: true,
    saveUninitialized: true,
  })
);

// Routes
app.use('/uploads', express.static('uploads'));  
app.use('/api', compilerRouter);            
app.use('/api', problemRoutes);          
app.use('/api', submissionRoutes);           
app.use('/api', userRoutes);                    
app.use('/api', uploadRoutes); 
app.use('/api', analyzeCodeRoute);    
app.use('./api',solutionRoutes);                 


module.exports = app;
