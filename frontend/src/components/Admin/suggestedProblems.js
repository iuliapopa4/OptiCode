import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";
import './css/suggestedproblems.css'; // Import the consolidated CSS file
import NavBar from "../NavBar/NavBar";


const SuggestedProblems = () => {
  const [suggestedProblems, setSuggestedProblems] = useState([]);
  const [filter, setFilter] = useState('all');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;

    const fetchSuggestedProblems = async () => {
      try {
        const response = await axios.get('/api/suggested-problems', {
          headers: { Authorization: token }
        });
        setSuggestedProblems(response.data);
      } catch (error) {
        console.error('Error fetching suggested problems:', error);
      }
    };

    fetchSuggestedProblems();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/update-suggested-problems/${id}`, { status: 'approved' }, {
        headers: { Authorization: token }
      });
      setSuggestedProblems(suggestedProblems.map(problem => 
        problem._id === id ? { ...problem, status: 'approved' } : problem
      ));
    } catch (error) {
      console.error('Error approving problem:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/update-suggested-problems/${id}`, { status: 'rejected' }, {
        headers: { Authorization: token }
      });
      setSuggestedProblems(suggestedProblems.map(problem => 
        problem._id === id ? { ...problem, status: 'rejected' } : problem
      ));
    } catch (error) {
      console.error('Error rejecting problem:', error);
    }
  };

  const filteredProblems = filter === 'all' 
    ? suggestedProblems 
    : suggestedProblems.filter(problem => problem.status === filter);

  return (
    <div className="suggested-problems">
      <NavBar />
      <h1>Suggested Problems</h1>
      <div className="filter-container">
        <select 
          className="filter-select" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <ul>
        {filteredProblems.map(problem => (
          <li key={problem._id}>
            <div className="problem-details">
              <h2 className="problem-title">{problem.title}</h2>
              <p className="problem-description">{problem.description}</p>
              <p className="problem-difficulty">Difficulty: {problem.difficulty}</p>
              <p className={`problem-status ${problem.status}`}>Status: {problem.status}</p>
            </div>
            <div className="problem-actions">
              <Link to={`/admin/editSuggestedProblem/${problem._id}`} className="edit-button">Edit</Link>
              {problem.status === 'pending' && (
                <>
                  <button onClick={() => handleApprove(problem._id)} className="approve-button">Approve</button>
                  <button onClick={() => handleReject(problem._id)} className="reject-button">Reject</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedProblems;
