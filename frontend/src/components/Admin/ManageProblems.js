import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './css/manageproblems.css'; // Import the consolidated CSS file
import NavBar from "../NavBar/NavBar";
import { AuthContext } from '../../context/AuthContext';

const ManageProblems = () => {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;
    // Fetch problems from the server
    axios.get('/api/getProblems', {
      headers: { Authorization: token }
    })
      .then(response => setProblems(response.data))
      .catch(error => console.error('Error fetching problems:', error));
  }, [token]);

  const handleDelete = (id) => {
    // Delete problem
    axios.delete(`/api/deleteProblem/${id}`, {
      headers: { Authorization: token }
    })
      .then(() => {
        // Remove the deleted problem from the state
        setProblems(problems.filter(problem => problem._id !== id));
      })
      .catch(error => console.error('Error deleting problem:', error));
  };

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-problems">
      <NavBar />
      <h1>Manage Problems</h1>
      <Link to="/admin/addProblem" className="add-problem-link">Add New Problem</Link>
      <input
        type="text"
        placeholder="Search by title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <ul>
        {filteredProblems.map(problem => (
          <li key={problem._id}>
            <div className="problem-details">
              <h2 className="problem-title">{problem.title}</h2>
              <p className="problem-text">{problem.text}</p>
            </div>
            <div className="problem-actions">
              <Link to={`/admin/editProblem/${problem._id}`}>Edit</Link>
              <button onClick={() => handleDelete(problem._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageProblems;
