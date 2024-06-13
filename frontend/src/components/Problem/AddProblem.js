import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from "../NavBar/NavBar";
import { AuthContext } from '../../context/AuthContext';
import './addproblem.css';

const AddProblem = () => {
  const [problemData, setProblemData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    code: '',
    testCases: ''
  });
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblemData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/suggestProblem', problemData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json'
        }
      });
      navigate('/problems');
    } catch (error) {
      console.error('Error suggesting problem:', error);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="add-problem-container">
        <h2>Suggest a Problem</h2>
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input type="text" name="title" value={problemData.title} onChange={handleChange} required />
          
          <label>Description:</label>
          <textarea name="description" value={problemData.description} onChange={handleChange} required></textarea>

          <label>Difficulty:</label>
          <select name="difficulty" value={problemData.difficulty} onChange={handleChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label>Code:</label>
          <textarea name="code" value={problemData.code} onChange={handleChange}></textarea>

          <label>Test Cases:</label>
          <textarea name="testCases" value={problemData.testCases} onChange={handleChange}></textarea>
          <small>Enter test cases in the format: assert function_name(param1, param2) == expected_result</small>

          <button type="submit">Suggest Problem</button>
        </form>
      </div>
    </div>
  );
};

export default AddProblem;
