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
        const sortedLeaderboard = response.data;
        setLeaderboard(sortedLeaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, [token, user]);

  // Find the current user in the leaderboard and extract their rank
  const currentUserIndex = leaderboard.findIndex(leaderboardUser => leaderboardUser._id === user._id);
  const currentUser = leaderboard[currentUserIndex];
  const otherUsers = leaderboard.filter(leaderboardUser => leaderboardUser._id !== user._id);

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
              <tr key={leaderboardUser._id} className={leaderboardUser._id === user._id ? 'highlight' : ''}>
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
