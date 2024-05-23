import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from "../NavBar/NavBar";
import './addproblem.css';

const AddProblem = () => {
  const [problemData, setProblemData] = useState({
    title: '',
    text: '',
    difficulty: 'easy',
    code: '',
    test_list: ''
  });

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
      await axios.post('/api/createProblem', problemData);
      navigate('/problems');
    } catch (error) {
      console.error('Error adding problem:', error);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="add-problem-container">
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input type="text" name="title" value={problemData.title} onChange={handleChange} required />
          
          <label>Description:</label>
          <textarea name="statement" value={problemData.statement} onChange={handleChange} required></textarea>

          <label>Difficulty:</label>
          <select name="difficulty" value={problemData.difficulty} onChange={handleChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label>Code:</label>
          <textarea name="code" value={problemData.code} onChange={handleChange}></textarea>

          <label>Test Cases:</label>
          <textarea name="test_list" value={problemData.test_list} onChange={handleChange}></textarea>
          <small>Enter test cases in the format: assert function_name(param1, param2) == expected_result</small>

          <button type="submit">Add Problem</button>
        </form>
      </div>
    </div>
  );
};

export default AddProblem;
