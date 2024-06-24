const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { evaluateSolution } = require('./evaluateSolution');
const analyzeSecurity = require('./analyzeSecurity');

const router = express.Router();

// Ensure the submissions directory exists
const submissionsDir = path.join(__dirname, 'submissions');
if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir, { recursive: true });

// Route to handle code compilation and execution
router.post('/compile', async (req, res) => {
    const { code, language, testCases = [], problemId } = req.body;

    // Validate input
    if (!code || !language) {
        return res.status(400).json({ error: 'Code or language not provided' });
    }

    // Currently, only Python language is supported
    if (language !== 'python') {
        return res.status(400).json({ error: 'Only Python language is supported' });
    }

    try {
        // Perform security analysis on the provided code
        const { success, feedback } = await analyzeSecurity(code);

        // If security issues are detected, return an error response
        if (!success) {
            return res.status(400).json({ error: 'Security issues detected', feedback });
        }

        // Generate a unique filename for the submission and save the code to a file
        const filename = uuidv4();
        const sourcePath = path.join(submissionsDir, `${filename}.py`);
        fs.writeFileSync(sourcePath, code);

        try {
            // Evaluate the solution using the provided code and problem ID
            const evaluation = await evaluateSolution(code, problemId);
            // Return the evaluation results
            res.json({ success: true, results: evaluation });
        } catch (error) {
            console.error('Error in processing the request:', error);
            // Return an error response if evaluation fails
            res.status(500).json({ success: false, error: error.message || "Execution failed. Please check your code and try again." });
        }
    } catch (error) {
        console.error('Error in security analysis:', error);
        // Return an error response if security analysis fails
        res.status(500).json({ success: false, error: error.message || 'Security analysis failed.' });
    }
});

module.exports = router;
