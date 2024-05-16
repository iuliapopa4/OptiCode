const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

router.post('/analyze', (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code not provided' });
    }

    const fs = require('fs');
    const path = require('path');
    const uuid = require('uuid').v4;
    const tempDir = path.join(__dirname, 'temp');
    const filename = `${uuid()}.py`;
    const filepath = path.join(tempDir, filename);

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    fs.writeFileSync(filepath, code);

    const process = spawn('python', ['code_analyzer.py', filepath]);

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        output += data.toString();
    });

    process.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        error += data.toString();
    });

    process.on('close', (code) => {
        fs.unlinkSync(filepath); 
        if (code !== 0) {
            res.status(500).json({ error: `Analyzer process exited with code ${code}. ${error}` });
        } else {
            res.json({ feedback: output });
        }
    });
});

module.exports = router;
