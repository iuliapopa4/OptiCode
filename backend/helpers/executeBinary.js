const { spawn } = require('child_process');

function executeBinary(executablePath, input) {
    return new Promise((resolve, reject) => {
        console.log(`Executing binary: ${executablePath} with input: ${input}`);
        // Start the executable as a child process
        const process = spawn(executablePath, { stdio: ['pipe', 'pipe', 'pipe'] });

        let output = ''; // output data from the process

        // Write the input to the process's stdin and close it
        process.stdin.write(input);
        process.stdin.end();

        // Handle data received from the process's stdout
        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            output += data.toString(); 
        });

        // Handle errors received from the process's stderr
        process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            // Handle errors received from the process's stderr
            reject(new Error(`Execution error: ${data.toString()}`));
        });

        // Handle errors received from the process's stderr
        process.on('close', (code) => {
            console.log(`Process exited with code: ${code}`);
            if (code === 0) {
                // If the process exits successfully, resolve with the output
                resolve(output.trim());
            } else {
                // If the process exits with an error code, reject the promise
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
}

module.exports = { executeBinary };
