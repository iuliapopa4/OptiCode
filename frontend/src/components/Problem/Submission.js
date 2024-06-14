import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { arduinoLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './submission.css';
import NavBar from '../NavBar/NavBar';

const Submission = () => {
  const { id: submissionId } = useParams();
  const { token } = useContext(AuthContext);
  const [submission, setSubmission] = useState(null);
  const [problem, setProblem] = useState(null);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    // Fetch submission details
    axios.get(`/api/subm/${submissionId}`, { headers: { Authorization: `${token}` } })
      .then(response => {
        setSubmission(response.data);

        // Fetch problem details using problemId from submission
        return axios.get(`/api/getProblemByObjectId/${response.data.problemId}`, { headers: { Authorization: `${token}` } });
      })
      .then(response => {
        setProblem(response.data);
      })
      .catch(error => {
        console.error('Error fetching details:', error.response ? error.response.data : error);
      });
  }, [submissionId, token]);

  const handleShareSolution = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/solutions/shareSolution', {
        problemId: problem._id,
        code: submission.code
      }, {
        headers: { Authorization: `${token}` }
      });
      setShareMessage('Solution shared successfully!');
      setTimeout(() => setShareMessage(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error('Error sharing solution:', error.response ? error.response.data : error);
      setShareMessage('Error sharing solution.');
    }
  };

  if (!submission || !problem) {
    return <div>Loading submission details...</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="submission-container">
        <div className="problem-details">
          <Link to={`/problems/${problem._id}`}>{problem.title}</Link>
        </div>
        <div className="submission-details">
          <p><strong>Submitted On:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
          <p><strong>Score:</strong> {submission.score}</p>
          <p><strong>Test Cases Passed:</strong> {submission.passedTests} out of {submission.totalTests}</p>
          <div>
            <ul>
              {submission.testResults.map((testResult, index) => (
                <li key={index}>
                  <p>Test Case: {testResult.testCase}</p>
                  <p>Passed: {testResult.passed ? 'Yes' : 'No'}</p>
                  {testResult.errorMessage && <p>Error: {testResult.errorMessage}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="code-snippet">
          <SyntaxHighlighter language={submission.language || 'text'} style={arduinoLight}>
            {submission.code}
          </SyntaxHighlighter>
        </div>
        {shareMessage && <p className="share-message">{shareMessage}</p>}
        <Link to="#" onClick={handleShareSolution} className="share-button">Share Solution</Link>
      </div>
    </div>
  );
};

export default Submission;
