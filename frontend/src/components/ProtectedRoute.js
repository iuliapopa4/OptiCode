import React, { useContext } from 'react';
import {  Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ component: Component, adminOnly, ...rest }) => {
  const { user } = useContext(AuthContext);


  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
