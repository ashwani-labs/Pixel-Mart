import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';
import { RequireRole } from '../components/auth/RequireRole';
import { AppLayout } from '../components/layout/AppLayout';
import { AdminPage } from '../pages/AdminPage';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'profile', element: <ProfilePage /> },
      {
        path: 'admin',
        element: (
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminProductsPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
    ],
  },
]);
