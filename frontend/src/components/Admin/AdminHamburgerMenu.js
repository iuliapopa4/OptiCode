import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUsers, FaTasks, FaClipboardList, FaComments, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import './css/menu.css';

const AdminHamburgerMenu = () => {
  // State to manage the menu open/close state
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  // Function to toggle the menu state
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await axios.get('/api/auth/signout');
      localStorage.removeItem('_appSignging');
      dispatch({ type: 'SIGNOUT' });
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-hamburger-menu">
      <div className="admin-hamburger-icon" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
      <nav className={`admin-menu ${isOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/admin/dashboard" onClick={toggleMenu}><FaUsers /> Dashboard</Link></li>
          <li><Link to="/admin/manage-users" onClick={toggleMenu}><FaUsers /> Manage Users</Link></li>
          <li><Link to="/admin/manage-problems" onClick={toggleMenu}><FaTasks /> Manage Problems</Link></li>
          <li><Link to="/admin/suggested-problems" onClick={toggleMenu}><FaClipboardList /> Suggested Problems</Link></li>
          <li><Link to="/admin/forum" onClick={toggleMenu}><FaComments /> Forum</Link></li>
          <li><Link to="/" onClick={toggleMenu}><FaUser /> View as User</Link></li> 
          <li><button onClick={handleLogout}><FaSignOutAlt /> Logout</button></li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminHamburgerMenu;
