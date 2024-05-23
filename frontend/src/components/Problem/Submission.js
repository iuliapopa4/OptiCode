import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './submission.css';
import NavBar from '../NavBar/NavBar';

const Submission = () => {
  const { id: submissionId } = useParams();
  const { token } = useContext(AuthContext);
  const [submission, setSubmission] = useState(null);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    if (!token) {
      console.error('Auth token is missing');
      return;
    }

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

  if (!submission || !problem) {
    return <div>Loading submission details...</div>;
  }

  return (
    <div>
    <NavBar />
    <div className="submission-container">
      <div className="problem-details">
        <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
      </div>
      <div className="submission-details">
        <p><strong>Submitted On:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
        <p><strong>Score:</strong> {submission.score}</p>
        <p><strong>Test Cases Passed:</strong> {submission.passedTests} out of {submission.totalTests}</p>
      </div>
      <div className="code-snippet">
        <SyntaxHighlighter language="python" style={dark}>
          {submission.code}
        </SyntaxHighlighter>
      </div>
    </div>
    </div>
  );
};

export default Submission;
