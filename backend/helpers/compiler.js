const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const submissionsDir = path.join(__dirname, 'submissions');
if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir, { recursive: true });
}

router.post('/compile', (req, res) => {
    const { code, language } = req.body;
    if (!code || !language) {
        return res.status(400).json({ error: 'Code or language not provided' });
    }

    const filename = uuidv4();
    const extensionMap = {
        'python': '.py',
        'c': '.c',
        'cpp': '.cpp'
    };
    const filepath = path.join(submissionsDir, `${filename}${extensionMap[language] || '.txt'}`);

    try {
        fs.writeFileSync(filepath, code);
        console.log(`File written successfully to: ${filepath}`);
    } catch (error) {
        console.error('Error writing file:', error);
        return res.status(500).json({ error: "Failed to create source file." });
    }

    let command;
    switch(language) {
        case 'python':
            command = `python "${filepath}"`;
            break;
        case 'c':
            command = `gcc "${filepath}" -o "${filepath}.exe" && "${filepath}.exe"`;
            break;
        case 'cpp':
            command = `g++ "${filepath}" -o "${filepath}.exe" && "${filepath}.exe"`;
            break;
        default:
            return res.status(400).json({ error: "Unsupported language" });
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Compilation error: ${error}`);
            return res.status(500).json({ error: stderr });
        } else {
            console.log("Compilation successful");
            res.json({ message: "Compilation successful", output: stdout });
        }

    });
});

module.exports = router;
