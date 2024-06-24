import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";
import { FaUsers, FaTasks, FaClipboardList, FaComments } from 'react-icons/fa';
import AdminHamburgerMenu from '../Admin/AdminHamburgerMenu';
import './css/admindashboard.css'; 

const AdminDashboard = () => {
    // State variables to store metrics
    const [totalUsers, setTotalUsers] = useState(null);
    const [totalProblems, setTotalProblems] = useState(null);
    const [pendingSuggestions, setPendingSuggestions] = useState(null);
    const [generalPostsCount, setGeneralPostsCount] = useState(null);
    const [helpPostsCount, setHelpPostsCount] = useState(null);
    const { token } = useContext(AuthContext);

    // useEffect to fetch metrics when the component mounts and token changes
    useEffect(() => {
        if (!token) return;

        const fetchMetrics = async () => {
            try {
                // Fetch total users
                const usersResponse = await axios.get('/api/users', {
                    headers: { Authorization: token }
                });
                setTotalUsers(usersResponse.data.length);

                // Fetch total problems
                const problemsResponse = await axios.get('/api/totalProblems', {
                    headers: { Authorization: token }
                });
                setTotalProblems(problemsResponse.data.totalProblems);

                // Fetch pending suggested problems
                const suggestionsResponse = await axios.get('/api/suggested-problems', {
                    headers: { Authorization: token }
                });
                const pendingCount = suggestionsResponse.data.filter(suggestion => suggestion.status === 'pending').length;
                setPendingSuggestions(pendingCount);

                // Fetch general forum posts count
                const generalPostsResponse = await axios.get('/api/forum/posts/count/general', {
                    headers: { Authorization: token }
                });
                setGeneralPostsCount(generalPostsResponse.data.count);

                // Fetch help forum posts count
                const helpPostsResponse = await axios.get('/api/forum/posts/count/help', {
                    headers: { Authorization: token }
                });
                setHelpPostsCount(helpPostsResponse.data.count);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        fetchMetrics();
    }, [token]);

    return (
        <div>
            <AdminHamburgerMenu/>
            <div className="admin-dashboard">
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
                    <Link to="/forum" className="metric">
                        <FaComments className="metric-icon" />
                        <h3>Forum</h3>
                        <p>General Posts: {generalPostsCount !== null ? generalPostsCount : 'Loading...'}</p>
                        <p>Help Requests: {helpPostsCount !== null ? helpPostsCount : 'Loading...'}</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
