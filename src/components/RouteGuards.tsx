import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 24 }}>Loading your workspace...</div>;
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return session ? <Navigate to="/home" replace /> : <Outlet />;
}
