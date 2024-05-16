const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Generates unique identifiers for file names
const { compileCode } = require('./compileCode');
const { executeBinary } = require('./executeBinary');
const { exec } = require('child_process');
const router = express.Router();

// Ensure the submissions directory exists
const submissionsDir = path.join(__dirname, 'submissions');
if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir, { recursive: true });

const parseString = require('xml2js').parseString; // XML parser for reading cppcheck output

// Run cppcheck, return the parsed XML results
function runCppCheck(sourcePath) {
    return new Promise((resolve, reject) => {
        const cmd = `cppcheck --enable=all --inconclusive --xml --xml-version=2 "${sourcePath}" 2> cppcheck_result.xml`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Cppcheck error: ${stderr}`);
                reject(`Cppcheck failed: ${stderr}`);
            } else {
                fs.readFile('cppcheck_result.xml', 'utf8', (err, data) => {
                    if (err) {
                        reject('Failed to read Cppcheck results');
                    } else {
                        parseString(data, { explicitArray: false }, (err, result) => {
                            if (err) {
                                reject('Failed to parse Cppcheck results');
                            } else {
                                resolve(result); 
                            }
                        });
                    }
                });
            }
        });
    });
}

router.post('/compile', async (req, res) => {
    const { code, language, testCases = [] } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code or language not provided' });
    }

    const filename = uuidv4();
    const sourcePath = path.join(submissionsDir, `${filename}.${language === 'python' ? 'py' : language}`);
    fs.writeFileSync(sourcePath, code);

    try {
        const executablePath = await compileCode(sourcePath, language);
        const results = await Promise.all(testCases.map(async (testCase) => {
            const output = await executeBinary(executablePath, testCase.input, language);
            const passed = output.trim() === testCase.output.trim();
            return {
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: output,
                passed
            };
        }));

        res.json({ results });
    } catch (error) {
        console.error('Error in processing the request:', error);
        res.status(500).json({ success: false, error: error.message || "Compilation failed. Please check your code and try again." });
    }
});


module.exports = router;