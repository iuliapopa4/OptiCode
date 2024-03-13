import React from 'react';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Avatar from '../Avatar/Avatar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SiFireship } from 'react-icons/si';
import './navbar.css';

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [isAvatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
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

  const goHome = () => {
    navigate('/');
  };

  const goProfile = () => {
    navigate('/profile');
  };

  const goProblems = () => {
    navigate('/problems');
  }

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <div className="navbar__logo" onClick={goHome}>
        <img src={require("../../img/logo.png")} alt="logo" />

        </div>
        <div className="navbar__search">
          <input type="text" placeholder="Search" />
        </div>
        <div className="navbar__problems" onClick={goProblems}>
        Problems
      </div>
      </div>
      <div className="navbar__right">
        <div className="navbar__streaks">
          <SiFireship className="streak-icon" />
          <span className="streak-count">{user && user.streaks}</span>
        </div>
        <div className="navbar__avatar" onClick={toggleAvatarDropdown}>
          {user && <Avatar imageUrl={user.avatar} />}
          {isAvatarDropdownOpen && (
            <div className="avatar-dropdown">
              <ul>
                <li onClick={goProfile}>Edit Profile</li>
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
