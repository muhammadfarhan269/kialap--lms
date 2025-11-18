import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If roles are specified and user doesn't have the required role, redirect
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect students to enroll-course, admins to all-courses
    if (user.role === 'student') {
      return <Navigate to="/enroll-course" replace />;
    } else if (user.role === 'administrator') {
      return <Navigate to="/all-courses" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
