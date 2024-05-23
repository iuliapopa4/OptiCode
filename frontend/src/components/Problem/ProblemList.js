import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from "../NavBar/NavBar";
import './problemlist.css';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get('/api/getProblems');
        setProblems(response.data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };
    fetchProblems();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setDifficultyFilter(e.target.value);
  };

  const filteredProblems = problems.filter((problem) => {
    return (
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!difficultyFilter || problem.difficulty === difficultyFilter)
    );
  });

  return (
    <div>
      <NavBar />
      <div className='problem'>
        <div className="filters">
          <Link to="/addProblem" className="add-problem-button">Suggest a Problem</Link>
          <div className="search-filter-wrapper">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <select onChange={handleDifficultyChange} value={difficultyFilter}>
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <ul>
          {filteredProblems.map(problem => (
            <li key={problem.id}>
              <Link to={`/problems/${problem.id}`}>
                <div className="problem-info">
                  <h3>{problem.title}</h3>
                  <p>{problem.statement}</p>
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
