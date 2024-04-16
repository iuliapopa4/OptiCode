import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './submission.css';

const Submission = () => {
  const { id: submissionId } = useParams(); 
  const { token } = useContext(AuthContext); 
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    if (!submissionId || !token) {
      console.error('Submission ID or Auth token is missing');
      return;
    }

    axios.get(`/api/submissions/${submissionId}`, { headers: { Authorization: `${token}` } }) 
      .then(response => {
        setSubmission(response.data);
      })
      .catch(error => {
        console.error('Error fetching submission details:', error.response ? error.response.data : error);
      });
}, [submissionId, token]);


  if (!submission) {
    return <div>Loading submission details...</div>;
  }

  return (
    <div className="submission-container">
        <div className="submission-header">
        </div>
        <div className="submission-details">
            <p><strong>Submitted On:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
            <p><strong>Result:</strong> {submission.result}</p>
            <p><strong>Test Cases Passed:</strong> {submission.testCasesPassed} out of {submission.totalTestCases}</p>
        </div>
        <div className="code-snippet">
            <pre><code>{submission.code}</code></pre>
        </div>
    </div>

  );
};

export default Submission;
