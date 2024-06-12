import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";
import { FaUsers, FaTasks, FaClipboardList, FaComments } from 'react-icons/fa';
import './css/admindashboard.css'; 
import NavBar from "../NavBar/NavBar";

const AdminDashboard = () => {
    const [totalUsers, setTotalUsers] = useState(null);
    const [totalProblems, setTotalProblems] = useState(null);
    const [pendingSuggestions, setPendingSuggestions] = useState(null);
    const [totalForumPosts, setTotalForumPosts] = useState(null);
    const { token } = useContext(AuthContext);

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

                const forumResponse = await axios.get('/api/forum/posts', {
                    headers: { Authorization: token }
                });
                setTotalForumPosts(forumResponse.data.length);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        fetchMetrics();
    }, [token]);

    return (
        <div className="admin-dashboard">
            <NavBar />
            <h1>Admin Dashboard</h1>
            <div className="dashboard-metrics">
                <Link to="/admin/manage-users" className="metric">
                    <FaUsers className="metric-icon" />
                    <h3> Users</h3>
                    <p>Total users: {totalUsers !== null ? totalUsers : 'Loading...'}</p>
                </Link>
                <Link to="/admin/manage-problems" className="metric">
                    <FaTasks className="metric-icon" />
                    <h3>Problems</h3>
                    <p>Total problems: {totalProblems !== null ? totalProblems : 'Loading...'}</p>
                </Link>
                <Link to="/admin/suggested-problems" className="metric">
                    <FaClipboardList className="metric-icon" />
                    <h3>Suggested Problems</h3>
                    <p>Pending: {pendingSuggestions !== null ? pendingSuggestions : 'Loading...'}</p>
                </Link>
                <Link to="/admin/forum" className="metric">
                    <FaComments className="metric-icon" />
                    <h3>Forum</h3>
                    <p>Number of posts: {totalForumPosts !== null ? totalForumPosts : 'Loading...'}</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
