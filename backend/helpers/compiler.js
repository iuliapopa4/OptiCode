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

router.post('/compile', async (req, res) => {
    const { code, language, testCases = [], problemId } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code or language not provided' });
    }

    if (language !== 'python') {
        return res.status(400).json({ error: 'Only Python language is supported' });
    }

    try {
        const { success, feedback } = await analyzeSecurity(code);

        if (!success) {
            return res.status(400).json({ error: 'Security issues detected', feedback });
        }

        const filename = uuidv4();
        const sourcePath = path.join(submissionsDir, `${filename}.py`);
        fs.writeFileSync(sourcePath, code);

        try {
            const evaluation = await evaluateSolution(code, problemId);
            res.json({ success: true, results: evaluation });
        } catch (error) {
            console.error('Error in processing the request:', error);
            res.status(500).json({ success: false, error: error.message || "Execution failed. Please check your code and try again." });
        }
    } catch (error) {
        console.error('Error in security analysis:', error);
        res.status(500).json({ success: false, error: error.message || 'Security analysis failed.' });
    }
});

module.exports = router;
