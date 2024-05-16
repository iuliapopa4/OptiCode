const { spawn } = require('child_process');

function executeBinary(executablePath, input, language) {
    return new Promise((resolve, reject) => {
        console.log(`Executing binary: ${executablePath} with input: ${input}`);
        let process;
        if (language === 'python') {
            process = spawn('python', [executablePath]);
        } else {
            process = spawn(executablePath, { stdio: ['pipe', 'pipe', 'pipe'] });
        }

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
                if (language === 'python' && error) {
                    const errorLines = error.split('\n');
                    const relevantErrorLine = errorLines.find(line => line.startsWith('NameError'));
                    const sanitizedError = relevantErrorLine ? relevantErrorLine : errorLines[errorLines.length - 1];
                    reject(new Error(sanitizedError.trim()));
                } else {
                    reject(new Error(`Execution error: ${error}`));
                }
            }
        });
    });
}

module.exports = { executeBinary };
