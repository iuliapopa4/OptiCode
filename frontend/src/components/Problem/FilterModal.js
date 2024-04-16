import React from 'react';
import './filtermodal.css';

const FilterModal = ({ filters, setFilters, applyFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Filter Problems</h2>
        <div>
          <label>Search Term:</label>
          <input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Difficulty:</label>
          <select name="difficulty" value={filters.difficulty} onChange={handleChange}>
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label>Data Structure:</label>
          <select name="dataStructure" value={filters.dataStructure} onChange={handleChange}>
            <option value="">All Data Structures</option>
            <option value="Array">Array</option>
            <option value="String">String</option>
            <option value="Linked List">Linked List</option>
          </select>
        </div>
        <div>
          <label>Algorithm:</label>
          <select name="algorithm" value={filters.algorithm} onChange={handleChange}>
            <option value="">All Algorithms</option>
            <option value="Sorting">Sorting</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="filter-modal-button" onClick={applyFilters}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
