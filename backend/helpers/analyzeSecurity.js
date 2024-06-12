const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

function analyzeSecurity(code) {
    return new Promise((resolve, reject) => {
        const tempFilePath = path.join(__dirname, 'tempCode.py');
        fs.writeFileSync(tempFilePath, code);

        execFile('python', [path.join(__dirname, '../securityCheck.py'), tempFilePath], (error, stdout, stderr) => {
            fs.unlinkSync(tempFilePath); // Clean up the temp file

            if (error) {
                console.log('Security analysis error:', stderr || 'Error executing security analysis');
                return reject({
                    success: false,
                    feedback: stderr || 'Error executing security analysis'
                });
            }

            console.log('Security analysis result:', stdout);
            resolve({
                success: stdout.includes('No security issues detected.'),
                feedback: stdout
            });
        });
    });
}

module.exports = analyzeSecurity;
