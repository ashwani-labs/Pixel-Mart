import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { selectHasRole, selectIsAuthenticated } from '../../store/slices/authSlice';
import { isAdminStorefrontPreviewEnabled } from '../../lib/adminStorefrontPreview';

/** Keeps the storefront for customers; signed-in admins are sent to the admin console. */
export function RequireCustomer({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector((s: RootState) => selectHasRole('ADMIN')(s));

  if (isAuthenticated && isAdmin && !isAdminStorefrontPreviewEnabled()) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
