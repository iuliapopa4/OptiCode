import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import NavBar from '../NavBar/NavBar';
import './leaderboard.css';
import { AuthContext } from '../../context/AuthContext';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter the leaderboard to include only users with the role "user"
        const filteredLeaderboard = response.data.filter(leaderboardUser => leaderboardUser.role === 'user');
        // Sort the filtered leaderboard by points (optional)
        const sortedLeaderboard = filteredLeaderboard.sort((a, b) => b.points - a.points);
        setLeaderboard(sortedLeaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, [token]);

  // Find the current user in the leaderboard and extract their rank
  const currentUserIndex = leaderboard.findIndex(leaderboardUser => leaderboardUser._id === user?._id);
  const currentUser = currentUserIndex !== -1 ? leaderboard[currentUserIndex] : null;
  const otherUsers = leaderboard.filter(leaderboardUser => leaderboardUser._id !== user?._id);

  return (
    <div className="leaderboard">
      <NavBar />
      <div className="leaderboard-container">
        <h1>Leaderboard</h1>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Level</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {currentUser && (
              <tr key={currentUser._id} className='highlight'>
                <td>{currentUserIndex + 1}</td>
                <td>{currentUser.name}</td>
                <td>{currentUser.level}</td>
                <td>{currentUser.points.toFixed(2)}</td>
              </tr>
            )}
            {otherUsers.map((leaderboardUser, index) => (
              <tr key={leaderboardUser._id}>
                <td>{currentUserIndex !== -1 && index >= currentUserIndex ? index + 2 : index + 1}</td>
                <td>{leaderboardUser.name}</td>
                <td>{leaderboardUser.level}</td>
                <td>{leaderboardUser.points.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
