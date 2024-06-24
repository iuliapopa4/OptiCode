import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import NavBar from '../NavBar/NavBar';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { arduinoLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './sharedsolutions.css';

const SharedSolutions = () => {
  const { id: problemId } = useParams();
  const { token } = useContext(AuthContext);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolutions = async () => {
      if (!problemId || !token) return;

      try {
        const response = await axios.get(`/api/solutions/${problemId}`, {
          headers: { Authorization: token }
        });
        setSolutions(response.data);
        console.log('Solutions:', response.data);
      } catch (error) {
        console.error('Error fetching solutions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [problemId, token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="shared-solutions-container">
        <h1>Shared Solutions</h1>
        {solutions.length > 0 ? (
          <ul className="solutions-list">
            {solutions.map(solution => (
              <li key={solution._id} className="solution-item">
                <p><strong>Added by:</strong> {solution.userId.name}</p>
                <div className="code-snippet">
                  <SyntaxHighlighter language="text" style={arduinoLight}>
                    {solution.code}
                  </SyntaxHighlighter>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No solutions shared yet.</p>
        )}
      </div>
    </div>
  );
};

export default SharedSolutions;
