import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from 'react-router-dom';
import './css/suggestedproblems.css'; 
import AdminHamburgerMenu from '../Admin/AdminHamburgerMenu';

const EditSuggestedProblem = () => {
  // State variables to store form input values
  const [problem, setProblem] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [testCases, setTestCases] = useState('');
  const [status, setStatus] = useState('pending'); 
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch the problem details when the component mounts and token changes
  useEffect(() => {
    if (!token) return;

    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/suggested-problems/${id}`, {
          headers: { Authorization: token }
        });
        const problemData = response.data;
        setProblem(problemData);
        setTitle(problemData.title);
        setDescription(problemData.description);
        setDifficulty(problemData.difficulty);
        setTestCases(problemData.testCases.join('\n'));
        setStatus(problemData.status); // Set the initial status
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    };

    fetchProblem();
  }, [token, id]);

  // Handle save button click to update the problem
  const handleSave = async () => {
    try {
      await axios.put(`/api/update-suggested-problems/${id}`, { title, description, difficulty, testCases: testCases.split('\n'), status }, {
        headers: { Authorization: token }
      });
      navigate('/admin/suggested-problems');
    } catch (error) {
      console.error('Error saving problem:', error);
    }
  };

  if (!problem) return <p>Loading...</p>;

  return (
    <div>
      <AdminHamburgerMenu />
      <div className="edit-problem">
        <h1>Edit Suggested Problem</h1>
        <form>
          <div>
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label>Test Cases</label>
            <textarea value={testCases} onChange={(e) => setTestCases(e.target.value)} />
          </div>
          <div>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button type="button" onClick={handleSave}>Save</button>
        </form>
      </div>
    </div>
  );
};

export default EditSuggestedProblem;
