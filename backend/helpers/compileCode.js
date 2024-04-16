// Compiles C or C++ source code into an executable

const { exec } = require('child_process');

function compileCode(sourcePath, language) {
    return new Promise((resolve, reject) => {
        // Create the path for the output executable by removing the source file extension
        const executablePath = sourcePath.replace(/\.(c|cpp)$/, '');
        const compileCommand = language === 'c' ? `gcc "${sourcePath}" -o "${executablePath}"` : `g++ "${sourcePath}" -o "${executablePath}"`;
        
        // Execute the compiler command
        exec(compileCommand, (error, stdout, stderr) => {
            if (error) {
                // Regular expression to remove specific path details from error messages for security and clarity
                const pathRegex = /D:\\thesis\\backend\\helpers\\submissions\\[a-z0-9-]+\.(c|cpp):/gi;
                // Sanitize the error message by removing file paths
                const sanitizedError = stderr.replace(pathRegex, ':');

                // Log the error to the console and reject the promise with an error object
                console.error(`Compilation error: ${sanitizedError}`);
                return reject({ success: false, error: `Compilation failed. ${sanitizedError}` });
            }
            // Resolve the promise with the path to the executable if compilation is successful
            resolve(executablePath);
        });
    });
}

module.exports = { compileCode };
