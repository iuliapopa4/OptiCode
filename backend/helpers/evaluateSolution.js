const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const Problem = require('../models/problemModel');

async function evaluateSolution(userCode, problemId) {
    return new Promise(async (resolve, reject) => {
        const tempFilename = `${uuidv4()}.py`;
        const tempFilePath = path.join(__dirname, 'submissions', tempFilename);

        // Fetch problem from the database using problemId
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return reject(new Error('Problem not found.'));
        }

        // Extract the function name and signature from the user's code using regex
        const userFunctionMatch = userCode.match(/def\s+(\w+)\s*\(([^)]*)\)/);
        if (!userFunctionMatch) {
            return reject(new Error('Error parsing user code: No function declaration found.'));
        }
        const userFunctionName = userFunctionMatch[1];
        const userFunctionArgs = userFunctionMatch[2];

        // Extract the function name and signature from the problem's code using regex
        const problemFunctionMatch = problem.code.match(/def\s+(\w+)\s*\(([^)]*)\)/);
        if (!problemFunctionMatch) {
            return reject(new Error('Error parsing problem code: Function definition not found.'));
        }
        const expectedFunctionName = problemFunctionMatch[1];
        const expectedFunctionArgs = problemFunctionMatch[2];

        // Replace the function name and arguments in the user's code to match the problem's function name and arguments
        const modifiedUserCode = userCode.replace(
            new RegExp(`def\\s+${userFunctionName}\\s*\\(${userFunctionArgs}\\)`, 'g'),
            `def ${expectedFunctionName}(${expectedFunctionArgs})`
        );

        // Combine the problem's code, modified user's code, and test cases
        const testCases = problem.test_list.map((test, index) =>
            `try:\n    ${test}\n    print("TEST_${index + 1}_PASSED")\nexcept AssertionError:\n    print("TEST_${index + 1}_FAILED")\nexcept Exception as e:\n    print("TEST_${index + 1}_ERROR", e)\n`
        ).join('\n');
        const combinedCode = `${problem.code}\n\n${modifiedUserCode}\n\n${testCases}`;

        fs.writeFileSync(tempFilePath, combinedCode);

        exec(`python "${tempFilePath}"`, (error, stdout, stderr) => {
            fs.unlinkSync(tempFilePath); // Clean up the temp file

            if (error) {
                console.error('Execution error:', stderr);

                // Extract relevant lines for display
                const errorLines = stderr.split('\n');
                const relevantLines = errorLines.filter(line => line.trim() !== '' && !line.includes(tempFilePath));
                const relevantError = relevantLines.slice(-3).join('\n'); // Get the last 3 lines of the error

                return reject(new Error(relevantError));
            }

            const outputLines = stdout.split('\n');
            const testResults = [];
            let passedTests = 0;

            outputLines.forEach((line, index) => {
                if (line.includes('PASSED')) {
                    passedTests += 1;
                    testResults.push({
                        testCase: problem.test_list[index],
                        passed: true,
                        errorMessage: null
                    });
                } else if (line.includes('FAILED')) {
                    testResults.push({
                        testCase: problem.test_list[index],
                        passed: false,
                        errorMessage: 'Assertion failed'
                    });
                } else if (line.includes('ERROR')) {
                    const errorMessage = line.split(' ').slice(2).join(' ');
                    testResults.push({
                        testCase: problem.test_list[index],
                        passed: false,
                        errorMessage: errorMessage
                    });
                }
            });

            const totalTests = problem.test_list.length;
            const score = (passedTests / totalTests) * 100.0; // Ensure score is a floating-point number

            // Generate feedback based on the number of test cases passed
            let feedback = '';
            if (passedTests === totalTests) {
                feedback = 'Excellent! All test cases passed.';
            } else if (passedTests > 0) {
                feedback = `Good job! You passed ${passedTests} out of ${totalTests} test cases.`;
            } else {
                feedback = 'None of the test cases passed. Please review your code and try again.';
            }

            resolve({
                totalTests,
                passedTests,
                score,
                output: stdout,
                feedback,
                testResults
            });
        });
    });
}

module.exports = { evaluateSolution };
