const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { compileCode } = require('./compileCode');
const { executeBinary } = require('./executeBinary');

const router = express.Router();
const submissionsDir = path.join(__dirname, 'submissions');
if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir, { recursive: true });

router.post('/compile', async (req, res) => {
    const { code, language, testCases = [] } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code or language not provided' });
    }

    const filename = uuidv4();
    const sourcePath = path.join(submissionsDir, `${filename}.${language}`);

    try {
        fs.writeFileSync(sourcePath, code);
        const executablePath = await compileCode(sourcePath, language);

        console.log('Starting test case execution...');
        const results = await Promise.all(testCases.map(async (testCase, index) => {
            const output = await executeBinary(executablePath, testCase.input);
            // Trim both expected and actual outputs to ensure consistent comparison
            const passed = output.trim() === testCase.output.trim();
        
            console.log(`Test Case ${index + 1}: Input: ${testCase.input}`);
            console.log(`Test Case ${index + 1}: Expected Output: ${testCase.output}`);
            console.log(`Test Case ${index + 1}: Actual Output: ${output}`);
            console.log(`Test Case ${index + 1}: Passed: ${passed}`);
        
            return { 
                input: testCase.input, 
                expectedOutput: testCase.output, 
                actualOutput: output, 
                passed 
            };
        }));
        
        console.log(results);   

        res.json({ results });
    } catch (error) {
        console.error('Error in processing the request:', error);
        res.status(500).json({ success: false, error: error.error || "Compilation failed. Please check your code and try again." });
    }
});


module.exports = router;
