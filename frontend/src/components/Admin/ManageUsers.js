import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './Admin.css'; // Import the consolidated CSS file
import { AuthContext } from "../../context/AuthContext";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { token } = useContext(AuthContext); 

  useEffect(() => {
    if (!token) return;

    // Fetch users from the server
    axios.get('/api/users', {
      headers: { Authorization: token } 
    })
      .then(response => {
        setUsers(response.data);
        setFilteredUsers(response.data);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, [token]);

  useEffect(() => {
    filterUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter]);

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = (id) => {
    if (!token) return;

    // Delete user
    axios.delete(`/api/users/${id}`, {
      headers: { Authorization: token } 
    })
      .then(() => {
        // Remove the deleted user from the state
        const updatedUsers = users.filter(user => user._id !== id);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
      })
      .catch(error => console.error('Error deleting user:', error));
  };

  return (
    <div className="manage-users">
      <h1>Manage Users</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <ul>
        {filteredUsers.map(user => (
          <li key={user._id}>
            <div className="user-details">
              <h2 className="user-name">{user.name}</h2>
              <p className="user-email">{user.email}</p>
              <p className="user-role">Role: {user.role}</p>
            </div>
            <div className="user-actions">
              <button onClick={() => handleDelete(user._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUsers;
