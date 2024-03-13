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
  const { token } = useContext(AuthContext);

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

  
  return (
    <div>
      <NavBar />
    <div className="problem"> 
      {problem ? (
        <div>
          <h1>{problem.title}</h1>
          <p>{problem.statement}</p>
          <p><strong>Input Format:</strong> {problem.inputFormat}</p>
          <p><strong>Output Format:</strong> {problem.outputFormat}</p>
          <h2>Examples:</h2>
          <ul>
            {problem.examples.map((example, index) => (
              <li key={index}>
                <p><strong>Input:</strong> {example.input}</p>
                <p><strong>Output:</strong> {example.output}</p>
              </li>
            ))}
          </ul>
          <CodeEditor problemId={problemId} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
    </div>

  );
};

export default ProblemPage;