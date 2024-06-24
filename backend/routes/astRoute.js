const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

router.post('/analyze', (req, res) => {
    const { code } = req.body;

    // Check if the code is provided in the request body
    if (!code) {
        return res.status(400).json({ error: 'Code not provided' });
    }

    const fs = require('fs');
    const path = require('path');
    const uuid = require('uuid').v4;
    const tempDir = path.join(__dirname, 'temp');
    const filename = `${uuid()}.py`;
    const filepath = path.join(tempDir, filename);

    // Ensure the temporary directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    // Write the provided code to a temporary file
    fs.writeFileSync(filepath, code);

    // Spawn a child process to run the code analyzer script
    const process = spawn('python', ['code_analyzer.py', filepath]);

    let output = '';
    let error = '';

    // Collect data from stdout
    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        output += data.toString();
    });

    // Collect data from stderr
    process.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        error += data.toString();
    });

    // Handle process close event
    process.on('close', (code) => {
        // Clean up the temporary file
        fs.unlinkSync(filepath); 
        
        if (code !== 0) {
            // If the process exited with an error code, respond with an error
            res.status(500).json({ error: `Analyzer process exited with code ${code}. ${error}` });
        } else {
            // If the process succeeded, respond with the analyzer feedback
            res.json({ feedback: output });
        }
    });
});

module.exports = router;
