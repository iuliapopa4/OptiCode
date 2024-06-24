import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './css/manageusers.css'; 
import { AuthContext } from "../../context/AuthContext";
import AdminHamburgerMenu from '../Admin/AdminHamburgerMenu';

const ManageUsers = () => {
  // State variables to store users and filters
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { token } = useContext(AuthContext);

  // useEffect to fetch users when the component mounts and token changes
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

  // useEffect to filter users when searchTerm or roleFilter changes
  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter]);

  // Function to filter users based on search term and role filter
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

  // Handle deleting a user
  const handleDelete = (id) => {
    if (!token) return;

    // Delete user from the server
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
    <div>
      <AdminHamburgerMenu />
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
    </div>
  );
};

export default ManageUsers;
