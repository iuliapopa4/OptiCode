import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './css/manageproblems.css'; 
import AdminHamburgerMenu from '../Admin/AdminHamburgerMenu';
import { AuthContext } from '../../context/AuthContext';

const ManageProblems = () => {
  // State variables to store problems and search term
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useContext(AuthContext);

  // useEffect to fetch problems when the component mounts and token changes
  useEffect(() => {
    if (!token) return;
    // Fetch problems from the server
    axios.get('/api/getProblems', {
      headers: { Authorization: token }
    })
      .then(response => setProblems(response.data))
      .catch(error => console.error('Error fetching problems:', error));
  }, [token]);

  // Handle deleting a problem
  const handleDelete = (id) => {
    // Delete problem from the server
    axios.delete(`/api/deleteProblem/${id}`, {
      headers: { Authorization: token }
    })
      .then(() => {
        // Remove the deleted problem from the state
        setProblems(problems.filter(problem => problem._id !== id));
      })
      .catch(error => console.error('Error deleting problem:', error));
  };

  // Filter problems based on the search term
  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <AdminHamburgerMenu />
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
    </div>
  );
};

export default ManageProblems;
