import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DemoAccessModal from './DemoAccessModal.jsx';

const ProtectedRoute = ({ children, allowedRoles, requireKyc }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  const getTargetRole = () => {
    if (location.pathname.startsWith('/admin') || allowedRoles?.includes('admin')) {
      return 'admin';
    }
    if (location.pathname.startsWith('/partner') || allowedRoles?.includes('partner')) {
      return 'partner';
    }
    if (location.pathname.startsWith('/delivery') || allowedRoles?.includes('delivery')) {
      return 'delivery';
    }
    return 'user';
  };

  const targetRole = getTargetRole();

  if (!isAuthenticated) {
    return <DemoAccessModal requestedRole={targetRole} returnPath={location.pathname} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <DemoAccessModal requestedRole={targetRole} returnPath={location.pathname} />;
  }

  if (requireKyc && user?.role === 'delivery' && user?.kyc?.status !== 'approved') {
    return <Navigate to="/delivery/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
