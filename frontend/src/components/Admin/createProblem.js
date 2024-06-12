import React, { useState } from 'react';
import axios from 'axios';
import './css/addproblems.css'; // Import the consolidated CSS file
import NavBar from "../NavBar/NavBar";

const CreateProblem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProblem = { title, description, difficulty, code, testCases: testCases.split('\n') };

    // Send new problem to the server
    axios.post('/api/createProblem', newProblem)
      .then(response => {
        console.log('Problem added:', response.data);
        // Redirect or update UI accordingly
      })
      .catch(error => console.error('Error adding problem:', error));
  };

  return (
    <div className="add-problem">
      <NavBar />
      <h1>Add New Problem</h1>
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
        <button type="submit">Add Problem</button>
      </form>
    </div>
  );
};

export default CreateProblem;
