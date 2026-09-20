import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  farmer: '/farmer',
  fpo_manager: '/fpo',
  buyer: '/buyer',
  field_agent: '/field-agent',
  admin: '/admin',
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirectPath = ROLE_DASHBOARD_MAP[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
