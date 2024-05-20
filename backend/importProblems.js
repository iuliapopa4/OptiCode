const mongoose = require('mongoose');
const fs = require('fs');
const Problem = require('./models/problemModel');
require('dotenv').config(); // Load environment variables

// Connect to MongoDB using the connection string from the environment variable
mongoose.connect(process.env.DB_URL, {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
  console.log('Connected to MongoDB');

  // Function to determine difficulty based on problem attributes
  const determineDifficulty = (text, code) => {
    const textLength = text.length;
    const codeLength = code.length;

    if (textLength < 100 && codeLength < 50) {
      return 'easy';
    } else if (textLength < 200 && codeLength < 100) {
      return 'medium';
    } else {
      return 'hard';
    }
  };

  // Function to generate a title from the text
  const generateTitle = (text) => {
    let title = text.split('. ')[0]; // Get the first sentence
    title = title.replace(/^Write a function to\s*/i, ''); // Remove "Write a function to"
    title = title.replace(/^Write a python function to\s*/i, ''); // Remove "Write a python function to"
    title = title.split(' ').slice(0, 5).join(' ');
    return title;
  };

  try {
    // Read and parse the JSON file
    const data = fs.readFileSync('./mbpp.json', 'utf8');
    const problems = JSON.parse(data);

    let problemCount = 0;

    for (const problem of problems) {
      try {
        // Ensure the required fields are present
        if (!problem.task_id || !problem.text || !problem.code) {
          console.error('Missing required fields:', problem);
          continue;
        }

        // Generate title from the first sentence of the text
        const title = generateTitle(problem.text);

        // Determine the difficulty of the problem
        const difficulty = determineDifficulty(problem.text, problem.code);

        // Mapping the structure of the JSON to the MongoDB schema
        const newProblem = new Problem({
          id: problem.task_id,
          title: title,
          text: problem.text,
          difficulty: difficulty,
          code: problem.code,
          test_list: problem.test_list 
        });

        await newProblem.save();
        problemCount++;
        console.log(`Problem ${problem.task_id} saved with difficulty ${difficulty}`);
      } catch (err) {
        console.error(`Error parsing or saving problem: ${err.message}\nProblem Data: ${JSON.stringify(problem)}`);
      }
    }

    console.log(`File processed, ${problemCount} problems saved.`);
  } catch (err) {
    console.error(`Error reading or parsing the file: ${err.message}`);
  } finally {
    mongoose.connection.close();
  }
});
