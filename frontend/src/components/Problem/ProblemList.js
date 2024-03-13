import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './problemlist.css';
import NavBar from "../NavBar/NavBar";

const ProblemList = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios.get('/api/getProblems')
      .then(response => setProblems(response.data))
      .catch(error => console.error('Error fetching problems:', error));
  }, []);

  return (
    <div>
      <NavBar/>
    <div className='problem'>
      <ul>
        {problems.map(problem => (
          <li key={problem._id}>
            <Link to={`/problems/${problem._id}`}>
              <div className="problem-info">
                <h3>{problem.title}</h3>
                <p> {problem.statement}</p>
                <p className={`difficulty-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
};

export default ProblemList;
