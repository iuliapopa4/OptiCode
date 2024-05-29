import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Admin.css'; // Import the consolidated CSS file

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState('');

  useEffect(() => {
    // Fetch problem details from the server
    axios.get(`/api/getProblemByObjectId/${id}`)
      .then(response => {
        const problem = response.data;
        setTitle(problem.title);
        setDescription(problem.description);
        setDifficulty(problem.difficulty);
        setCode(problem.code);
        setTestCases(problem.testCases.join('\n'));
      })
      .catch(error => console.error('Error fetching problem:', error));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProblem = { title, description, difficulty, code, testCases: testCases.split('\n') };

    // Send updated problem to the server
    axios.put(`/api/updateProblem/${id}`, updatedProblem)
      .then(response => {
        console.log('Problem updated:', response.data);
        navigate('/admin/manage-problems');
      })
      .catch(error => console.error('Error updating problem:', error));
  };

  return (
    <div className="edit-problem">
      <h1>Edit Problem</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label>Code</label>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div>
          <label>Test Cases (one per line)</label>
          <textarea value={testCases} onChange={(e) => setTestCases(e.target.value)} />
        </div>
        <button type="submit">Update Problem</button>
      </form>
    </div>
  );
};

export default EditProblem;
