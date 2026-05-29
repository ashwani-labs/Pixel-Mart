import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';
import { RequireRole } from '../components/auth/RequireRole';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminReviewsPage } from '../pages/AdminReviewsPage';
import { AdminOffersPage } from '../pages/AdminOffersPage';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { AdminSettingsPage } from '../pages/AdminSettingsPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { AdminOrdersPage } from '../pages/AdminOrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { OrdersListPage } from '../pages/OrdersListPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProfileAddressesPage } from '../pages/ProfileAddressesPage';
import { RegisterPage } from '../pages/RegisterPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

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
      { path: 'profile/addresses', element: <ProfileAddressesPage /> },
      {
        path: 'wishlist',
        element: (
          <RequireAuth>
            <WishlistPage />
          </RequireAuth>
        ),
      },
      {
        path: 'cart',
        element: (
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        ),
      },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      {
        path: 'orders',
        element: (
          <RequireAuth>
            <OrdersListPage />
          </RequireAuth>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <RequireAuth>
            <OrderDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin',
        element: (
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'categories', element: <AdminCategoriesPage /> },
          { path: 'offers', element: <AdminOffersPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'reviews', element: <AdminReviewsPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
        ],
      },
    ],
  },
]);
