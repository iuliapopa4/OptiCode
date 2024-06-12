import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Avatar from '../Avatar/Avatar';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { SiFireship } from 'react-icons/si';
import { FaBars, FaTimes } from 'react-icons/fa';
import './navbar.css';

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [isAvatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.get('/api/auth/signout');
      localStorage.removeItem('_appSignging');
      dispatch({ type: 'SIGNOUT' });
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  const toggleAvatarDropdown = () => {
    setAvatarDropdownOpen(!isAvatarDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const goHome = () => {
    navigate('/');
  };

  const goProfile = () => {
    navigate('/profile');
  };

  const goEdit = () => {
    navigate('/editprofile');
  };

  const goProblems = () => {
    navigate('/problems');
  };

  const goLeaderboard = () => {
    navigate('/leaderboard');
  };

  const goForum = () => {
    navigate('/forum');
  };

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <div className="navbar__logo" onClick={goHome}>
          <img src={require("../../img/logo.png")} alt="logo" />
        </div>
        <div className={`navbar__menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="navbar__problems" onClick={goProblems}>
            Problems
          </div>
          <div className="navbar__problems" onClick={goLeaderboard}>
            Leaderboard
          </div>
          <div className="navbar__problems" onClick={goForum}>
            Forum
          </div>
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
                <li onClick={goProfile}>View Profile</li>
                <li onClick={goEdit}>Edit Profile</li>
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
