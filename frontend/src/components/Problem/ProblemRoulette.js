import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProblemRoulette.css';

const ProblemRouletteModal = ({ isOpen, onClose }) => {
  const { token } = useContext(AuthContext);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchRandomProblem = async () => {
        try {
          const response = await axios.get('/api/random-unsolved', {
            headers: { Authorization: token }
          });
          setProblem(response.data);
          setLoading(false);
        } catch (err) {
          setError('No unsolved problems available or an error occurred.');
          setLoading(false);
        }
      };
      fetchRandomProblem();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <div className="roulette-modal-overlay">
      <div className="roulette-modal">
        <button className="close-button" onClick={onClose}>×</button>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {problem && (
          <div>
            <h2>{problem.title}</h2>
            <p className="problem-text">{problem.text}</p>
            <Link to={`/problems/${problem._id}`} onClick={onClose}>Solve this problem</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemRouletteModal;
