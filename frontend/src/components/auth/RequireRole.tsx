import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { selectAuthUser } from '../../store/slices/authSlice';

interface RequireRoleProps {
  role: string;
  children: React.ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const user = useSelector((s: RootState) => selectAuthUser(s));

  if (!user?.roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
