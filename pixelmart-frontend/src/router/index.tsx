import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';
import { RequireCustomer } from '../components/auth/RequireCustomer';
import { RequireRole } from '../components/auth/RequireRole';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { AdminAuditLogPage } from '../pages/AdminAuditLogPage';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminHomepagePage } from '../pages/AdminHomepagePage';
import { AdminReviewsPage } from '../pages/AdminReviewsPage';
import { AdminOffersPage } from '../pages/AdminOffersPage';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { AdminSettingsPage } from '../pages/AdminSettingsPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
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
import {
  FaqPage,
  PrivacyPolicyPage,
  ReturnsPolicyPage,
  ShippingPolicyPage,
  TermsPage,
} from '../pages/policy/PolicyPages';

export const router = createBrowserRouter([
  { path: '/admin-login', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: (
      <RequireAuth loginPath="/admin-login">
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
      { path: 'homepage', element: <AdminHomepagePage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'audit-log', element: <AdminAuditLogPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
  {
    path: '/',
    element: (
      <RequireCustomer>
        <AppLayout />
      </RequireCustomer>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'shipping', element: <ShippingPolicyPage /> },
      { path: 'returns', element: <ReturnsPolicyPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/addresses', element: <ProfileAddressesPage /> },
      { path: 'wishlist', element: <RequireAuth><WishlistPage /></RequireAuth> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
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
    ],
  },
]);
