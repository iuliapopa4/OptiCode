import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";
import { FaUsers, FaTasks, FaClipboardList } from 'react-icons/fa';
import './Admin.css'; // Import the consolidated CSS file

const AdminDashboard = () => {
    const [totalUsers, setTotalUsers] = useState(null);
    const [totalProblems, setTotalProblems] = useState(null);
    const [pendingSuggestions, setPendingSuggestions] = useState(null);
    const { token } = useContext(AuthContext); // Extract token from AuthContext

    useEffect(() => {
        if (!token) return;

        const fetchMetrics = async () => {
            try {
                const usersResponse = await axios.get('/api/users', {
                    headers: { Authorization: token }
                });
                setTotalUsers(usersResponse.data.length);

                const problemsResponse = await axios.get('/api/totalProblems', {
                    headers: { Authorization: token }
                });
                setTotalProblems(problemsResponse.data.totalProblems);

                const suggestionsResponse = await axios.get('/api/suggested-problems', {
                    headers: { Authorization: token }
                });
                const pendingCount = suggestionsResponse.data.filter(suggestion => suggestion.status === 'pending').length;
                setPendingSuggestions(pendingCount);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        fetchMetrics();
    }, [token]);

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <div className="dashboard-metrics">
                <Link to="/admin/manage-users" className="metric">
                    <FaUsers className="metric-icon" />
                    <h3>Total Users</h3>
                    <p>{totalUsers !== null ? totalUsers : 'Loading...'}</p>
                </Link>
                <Link to="/admin/manage-problems" className="metric">
                    <FaTasks className="metric-icon" />
                    <h3>Total Problems</h3>
                    <p>{totalProblems !== null ? totalProblems : 'Loading...'}</p>
                </Link>
                <Link to="/admin/suggested-problems" className="metric">
                    <FaClipboardList className="metric-icon" />
                    <h3>Suggested Problems</h3>
                    <p>{pendingSuggestions !== null ? pendingSuggestions : 'Loading...'}</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
