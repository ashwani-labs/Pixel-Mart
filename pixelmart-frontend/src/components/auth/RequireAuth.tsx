import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

export function RequireAuth({
  children,
  loginPath = '/login',
}: {
  children: React.ReactNode;
  loginPath?: string;
}) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
