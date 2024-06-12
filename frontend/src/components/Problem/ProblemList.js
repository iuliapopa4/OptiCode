import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from "../NavBar/NavBar";
import { AuthContext } from "../../context/AuthContext";
import './problemlist.css';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // New state for status filter
  const { user } = useContext(AuthContext); // Get user information from the auth context

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

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const getBorderColor = (problemId) => {
    if (!user || !user.highestScores) return 'none';

    const scoreData = user.highestScores.find(score => score.problemId === problemId);
    if (!scoreData) return 'none';

    const { score } = scoreData;
    if (score === 100) return 'green-border';
    if (score > 0) return 'yellow-border';
    if (score === 0) return 'red-border';
    return 'none';
  };

  const getStatus = (problemId) => {
    if (!user || !user.highestScores) return 'not-tried';

    const scoreData = user.highestScores.find(score => score.problemId === problemId);
    if (!scoreData) return 'not-tried';

    const { score } = scoreData;
    if (score === 100) return 'solved';
    if (score > 0) return 'not-perfect';
    if (score === 0) return 'not-solved';
    return 'not-tried';
  };

  const filteredProblems = problems.filter((problem) => {
    const problemStatus = getStatus(problem._id);
    return (
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!difficultyFilter || problem.difficulty === difficultyFilter) &&
      (statusFilter === 'all' || statusFilter === problemStatus)
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
            <select onChange={handleStatusChange} value={statusFilter}>
              <option value="all">Score</option>
              <option value="solved">100%</option>
              <option value="not-perfect">0%-99%</option>
              <option value="not-tried">Not Tried</option>
            </select>
          </div>
        </div>
        <ul>
          {filteredProblems.map(problem => (
            <li key={problem._id} className={getBorderColor(problem._id)}>
              <Link to={`/problems/${problem._id}`}>
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
