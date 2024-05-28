const { spawn } = require('child_process');

function executeBinary(executablePath, input, language) {
    return new Promise((resolve, reject) => {
        console.log(`Executing Python script: ${executablePath} with input: ${input}`);
        const process = spawn('python', [executablePath]);

        let output = '';
        let error = '';

        process.stdin.setEncoding('utf-8');
        process.stdout.setEncoding('utf-8');
        process.stderr.setEncoding('utf-8');

        process.stdin.write(input);
        process.stdin.end();

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            output += data;
        });

        process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            error += data;
        });

        process.on('close', (code) => {
            console.log(`Process exited with code: ${code}`);
            if (code === 0) {
                resolve(output.trim());
            } else {
                // Extract the relevant error message for Python
                if (error) {
                    const errorLines = error.split('\n');
                    // Filter out lines that are not relevant
                    const relevantErrorLines = errorLines.filter(line => line.includes('Error') || line.match(/^\s*File\s/));
                    // Find the line that caused the error and the error message
                    const causeIndex = errorLines.findIndex(line => line.includes('Error'));
                    const causeLines = errorLines.slice(causeIndex - 1, causeIndex + 1).join('\n');
                    const sanitizedError = relevantErrorLines.length > 0 ? relevantErrorLines.join('\n') : causeLines;

                    reject(new Error(sanitizedError.trim()));
                } else {
                    reject(new Error(`Execution error: ${error}`));
                }
            }
        });
    });
}

module.exports = { executeBinary };
