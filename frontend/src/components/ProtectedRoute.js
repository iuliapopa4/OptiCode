import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ component: Component, adminOnly, ...rest }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    return <Navigate to="/admin/dashboard" />; 
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />; // Redirect to home if not an admin
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
