import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './css/editproblems.css'; 
import AdminHamburgerMenu from '../Admin/AdminHamburgerMenu';
import { AuthContext } from '../../context/AuthContext';

const EditProblem = () => {
  // Extract problem ID from the URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState({});
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;

    // Fetch problem details from the server
    axios.get(`/api/getProblemByObjectId/${id}`, {
      headers: { Authorization: token }
    })
      .then(response => {
        setProblem(response.data);
      })
      .catch(error => console.error('Error fetching problem:', error));
  }, [id, token]);

  // Handle changes in form fields
  const handleFieldChange = (field, value) => {
    setProblem(prevProblem => ({ ...prevProblem, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Update each field separately
    const updatePromises = Object.keys(problem).map(field => {
      return axios.patch(`/api/updateProblemField/${id}`, { field, value: problem[field] }, {
        headers: { Authorization: token }
      });
    });

    Promise.all(updatePromises)
      .then(responses => {
        console.log('Problem updated:', responses);
        navigate('/admin/manage-problems');
      })
      .catch(error => console.error('Error updating problem:', error));
  };

  return (
    <div className="edit-problem">
      <AdminHamburgerMenu />
      <h1>Edit Problem</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={problem.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={problem.text || ''}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            required
          />
        </div>
        <div>
          <label>Difficulty</label>
          <select
            value={problem.difficulty || 'easy'}
            onChange={(e) => handleFieldChange('difficulty', e.target.value)}
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label>Code</label>
          <textarea
            value={problem.code || ''}
            onChange={(e) => handleFieldChange('code', e.target.value)}
          />
        </div>
        <div>
          <label>Test Cases (one per line)</label>
          <textarea
            value={problem.testCases || ''}
            onChange={(e) => handleFieldChange('testCases', e.target.value)}
          />
        </div>
        <button type="submit">Update Problem</button>
      </form>
    </div>
  );
};

export default EditProblem;
