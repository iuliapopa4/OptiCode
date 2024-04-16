import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from "../NavBar/NavBar";
import './problemlist.css';
import FilterModal from './FilterModal';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    difficulty: '',
    dataStructure: '',
    algorithm: '',
  });

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

  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);

  const applyFilters = () => {
    toggleFilterModal();
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesDifficulty = !filters.difficulty || problem.difficulty === filters.difficulty;
    const matchesDataStructure = !filters.dataStructure || problem.tags.includes(filters.dataStructure);
    const matchesAlgorithm = !filters.algorithm || problem.tags.includes(filters.algorithm);
    const matchesSearchTerm = problem.title.toLowerCase().includes(filters.searchTerm.toLowerCase());
  
    return matchesDifficulty && matchesDataStructure && matchesAlgorithm && matchesSearchTerm;
  });
  

  return (
    <div>
      <NavBar />
      <div className='problem'>
        <div className="filters">
          <button onClick={toggleFilterModal}>Filter Problems</button>
        </div>
        {isFilterModalOpen && (
          <FilterModal 
            filters={filters} 
            setFilters={setFilters} 
            applyFilters={applyFilters} 
            onClose={toggleFilterModal} 
          />
        )}
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
