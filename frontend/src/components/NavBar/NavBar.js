import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Avatar from '../Avatar/Avatar';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { SiFireship } from 'react-icons/si';
import { FaBars, FaTimes } from 'react-icons/fa';
import './navbar.css';

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext); // Access user and dispatch from AuthContext
  const [isAvatarDropdownOpen, setAvatarDropdownOpen] = useState(false); // State to toggle avatar dropdown
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // State to toggle mobile menu
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Handle user logout
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.get('/api/auth/signout');
      localStorage.removeItem('_appSignging'); // Remove item from local storage
      dispatch({ type: 'SIGNOUT' }); // Dispatch SIGNOUT action to context
      navigate('/'); // Navigate to home page
    } catch (err) {
      console.log(err);
    }
  };

  // Toggle avatar dropdown visibility
  const toggleAvatarDropdown = () => {
    setAvatarDropdownOpen(!isAvatarDropdownOpen);
  };

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <div className="navbar__logo">
          <Link to="/">
            <img src={require("../../img/logo.png")} alt="logo" />
          </Link>
        </div>
        <div className={`navbar__menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/problems" className="navbar__problems">
            Problems
          </Link>
          <Link to="/leaderboard" className="navbar__problems">
            Leaderboard
          </Link>
          <Link to="/forum" className="navbar__problems">
            Forum
          </Link>
        </div>
        <div className="navbar__mobile-icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
      <div className="navbar__right">
        <div className="navbar__streaks">
          <SiFireship className="streak-icon" />
          <span className="streak-count">{user && user.streaks}</span>
          <span className="tooltip-text">Consecutive days of coding</span>
        </div>
        {user && user.role === 'admin' && (
          <div className="navbar__admin-links">
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          </div>
        )}
        <div className="navbar__avatar" onClick={toggleAvatarDropdown}>
          {user && <Avatar imageUrl={user.avatar} />}
          {isAvatarDropdownOpen && (
            <div className="avatar-dropdown">
              <ul>
                <li>
                  <Link to="/profile">View Profile</Link>
                </li>
                <li>
                  <Link to="/editprofile">Edit Profile</Link>
                </li>
                <li onClick={handleLogout}>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
