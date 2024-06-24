const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to analyze security of provided code
function analyzeSecurity(code) {
    return new Promise((resolve, reject) => {
        // Define temporary file path for the code to be analyzed
        const tempFilePath = path.join(__dirname, 'tempCode.py');
        
        // Write the provided code to the temporary file
        fs.writeFileSync(tempFilePath, code);

        // Execute the security check script with the temporary file as argument
        execFile('python', [path.join(__dirname, '../securityCheck.py'), tempFilePath], (error, stdout, stderr) => {
            // Clean up the temporary file
            fs.unlinkSync(tempFilePath);

            // Handle errors during execution
            if (error) {
                console.log('Security analysis error:', stderr || 'Error executing security analysis');
                return reject({
                    success: false,
                    feedback: stderr || 'Error executing security analysis'
                });
            }

            // Log the result of the security analysis
            console.log('Security analysis result:', stdout);
            
            // Resolve the promise with the analysis result
            resolve({
                success: stdout.includes('No security issues detected.'),
                feedback: stdout
            });
        });
    });
}

module.exports = analyzeSecurity;
