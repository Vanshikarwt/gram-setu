import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface RouteWrapperProps {
  children: React.ReactElement;
}

/**
 * ProtectedRoute: Wraps pages that require authentication.
 * Redirects unauthenticated users to the Login page.
 */
export const ProtectedRoute: React.FC<RouteWrapperProps> = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * PublicRoute: Wraps authentication pages (Login, Signup).
 * Redirects already authenticated users to the home dashboard page.
 */
export const PublicRoute: React.FC<RouteWrapperProps> = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
