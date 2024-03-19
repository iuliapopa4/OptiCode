const { spawn } = require('child_process');

function executeBinary(executablePath, input) {
    return new Promise((resolve, reject) => {
        console.log(`Executing binary: ${executablePath} with input: ${input}`);
        const process = spawn(executablePath, { stdio: ['pipe', 'pipe', 'pipe'] });
        let output = '';

        process.stdin.write(input);
        process.stdin.end();

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            reject(new Error(`Execution error: ${data.toString()}`));
        });

        process.on('close', (code) => {
            console.log(`Process exited with code: ${code}`);
            if (code === 0) {
                resolve(output.trim());
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
}

module.exports = { executeBinary };
