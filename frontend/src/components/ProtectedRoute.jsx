import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ roles }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Validating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (roles && user && !roles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

