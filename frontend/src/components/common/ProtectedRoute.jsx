import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles, requireKyc }) => {
 const { isAuthenticated, user } = useSelector(state => state.auth);
 const location = useLocation();

 if (!isAuthenticated) {
 // Redirect admin routes to the options login page, others to the start (home) page
 const redirectPath = location.pathname.startsWith('/admin') ? '/login' : '/';
 return <Navigate to={redirectPath} state={{ from: location }} replace />;
 }

 if (allowedRoles && !allowedRoles.includes(user?.role)) {
 // Redirect to unauthorized page or default landing pages depending on role
 if (user?.role === 'admin') {
 return <Navigate to="/admin" replace />;
 } else if (user?.role === 'delivery') {
 return <Navigate to="/delivery" replace />;
 }
 return <Navigate to="/" replace />;
 }

 if (requireKyc && user?.role === 'delivery' && user?.kyc?.status !== 'approved') {
 return <Navigate to="/delivery/onboarding" replace />;
 }

 return children;
};

export default ProtectedRoute;
