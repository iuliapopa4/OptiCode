import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Admin.css'; // Import the consolidated CSS file

const ManageProblems = () => {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch problems from the server
    axios.get('/api/getProblems')
      .then(response => setProblems(response.data))
      .catch(error => console.error('Error fetching problems:', error));
  }, []);

  const handleDelete = (id) => {
    // Delete problem
    axios.delete(`/api/deleteProblem/${id}`)
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
