// Compiles C or C++ source code into an executable and interpret python

const { exec } = require('child_process');

function compileCode(sourcePath, language) {
    return new Promise((resolve, reject) => {
        if (language === 'python') {
            resolve(sourcePath);
        } else {
            const executablePath = sourcePath.replace(/\.(c|cpp)$/, '');
            const compileCommand = language === 'c' ? `gcc "${sourcePath}" -o "${executablePath}"` : `g++ "${sourcePath}" -o "${executablePath}"`;
            exec(compileCommand, (error, stdout, stderr) => {
                if (error) {
                    const pathRegex = /D:\\thesis\\backend\\helpers\\submissions\\[a-z0-9-]+\.(c|cpp):/gi;
                    const sanitizedError = stderr.replace(pathRegex, ':');
                    console.error(`Compilation error: ${sanitizedError}`);
                    return reject({ success: false, error: `Compilation failed. ${sanitizedError}` });
                }
                resolve(executablePath);
            });
        }
    });
}

module.exports = { compileCode };
