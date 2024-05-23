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

  return (
    <div>
      <NavBar />
      <div className="problem"> 
        {problem ? (
          <div>
            <div className="divider"></div>
            <h1>{problem.title}</h1>
            <p>{problem.text}</p>
            <CodeEditor problemId={problem._id} testCases={problem.examples} userId={user._id} />
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="submissions-section">
        <ul>
          {submissions.map((submission) => {
            const score = submission.score ? submission.score : 'Score not available';
            const resultClass = parseInt(submission.score) === 100 ? 'result-success' : parseInt(submission.score) === 0 ? 'result-fail' : 'result-partial';
            return (
              <li key={submission._id} className={resultClass}>
                <a href={`/submission/${submission._id}`}>Submission on {new Date(submission.createdAt).toLocaleString()}</a> {score}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ProblemPage;
