import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import CodeEditor from '../CodeEditor/CodeEditor';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './problempage.css'; 
import NavBar from "../NavBar/NavBar"

const ProblemPage = () => {
  const { id: problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const { token, user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [showHints, setShowHints] = useState(false); 

  useEffect(() => {
    console.log('Fetching problem details...');
    if (!problemId || !token) {
      console.error('Problem ID or Auth token is missing');
      return;
    }

    axios.get(`/api/getProblem/${problemId}`, { headers: { Authorization: token } })
      .then(response => {
        console.log('Problem details fetched:', response.data);
        setProblem(response.data);
      })
      .catch(error => {
        console.error('Error fetching problem:', error);
        setProblem(null);
      });
  }, [problemId, token]);

  useEffect(() => {
    if (!problem || !token || !user._id) {
      console.log('Waiting for problem details...');
      return;
    }
  
    axios.get(`/api/submissions/${user._id}/${problem._id}`, { headers: { Authorization: token } })
      .then(response => {
        console.log('Submissions fetched:', response.data);
        setSubmissions(response.data);
      })
      .catch(error => {
        console.error('Error fetching submissions:', error);
      });
  }, [problem, token, user._id]);

  const toggleHints = () => setShowHints(!showHints); 
  
  return (
    <div>
      <NavBar />
      <div className="problem"> 
        {problem ? (
          <div>
            <div className="divider"></div>
            <h1>{problem.title}</h1>
            <p>{problem.statement}</p>
            <p><strong>Input Format:</strong> {problem.inputFormat}</p>
            <p><strong>Output Format:</strong> {problem.outputFormat}</p>
            <h2>Example:</h2>
            {problem.examples.length > 0 && (
              <ul>
                <li>
                  <p><strong>Input:</strong> {problem.examples[0].input}</p>
                  <p><strong>Output:</strong> {problem.examples[0].output}</p>
                </li>
              </ul>
            )}
            {problem.hints && problem.hints.length > 0 && (
              <div>
                <button onClick={toggleHints} className="hintsButton">
                  {showHints ? 'Hide Hints' : 'Reveal Hints'}
                </button>

                {showHints && (
                  <ul>
                    {problem.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <CodeEditor problemId={problem._id} testCases={problem.examples} userId={user._id} />
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="submissions-section">
        <ul>
          {submissions.map((submission) => {
            const resultPercentage = parseInt(submission.result.replace('Score: ', '').replace('%', ''));
            let resultClass = '';
            if (resultPercentage === 100) {
              resultClass = 'result-success';
            } else if (resultPercentage === 0) {
              resultClass = 'result-fail';
            } else {
              resultClass = 'result-partial';
            }

            return (
              <li key={submission._id} className={resultClass}>
                <a href={`/submission/${submission._id}`}>Submission on {new Date(submission.createdAt).toLocaleString()}</a> {submission.result}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ProblemPage;
