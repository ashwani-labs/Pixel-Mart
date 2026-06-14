import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { RootState } from '../../store';
import { FALLBACK_SUPER_CATEGORIES } from '../../lib/catalogFallbacks';
import { useGetSuperCategoriesQuery } from '../../store/api/catalogApi';
import { useLogoutMutation } from '../../store/api/authApi';
import { useGetCartQuery } from '../../store/api/orderApi';
import { clearCredentials, selectAuthUser, selectHasRole, selectIsAuthenticated } from '../../store/slices/authSlice';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

const FALLBACK_AISLES = FALLBACK_SUPER_CATEGORIES;

export function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const user = useSelector((s: RootState) => selectAuthUser(s));
  const isAdmin = useSelector((s: RootState) => selectHasRole('ADMIN')(s));
  const storeName = useSelector((s: RootState) => s.settings.storeName);
  const logoUrl = useSelector((s: RootState) => s.settings.logoUrl);
  const [logoutApi] = useLogoutMutation();
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const { data: superCategories } = useGetSuperCategoriesQuery();
  const navAisles = superCategories?.length ? superCategories : FALLBACK_AISLES;
  const cartQty = cart?.totalQuantity ?? 0;
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Clear local session even if API fails
    }
    dispatch(clearCredentials());
    navigate('/');
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium no-underline hover:no-underline ${
      isActive ? 'bg-white/25 text-on-brand' : 'text-on-brand/90 hover:bg-white/15 hover:text-on-brand'
    }`;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-50 bg-brand shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-lg font-bold text-on-brand no-underline hover:no-underline"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-black text-accent-foreground">
                M
              </span>
            )}
            <span>{storeName}</span>
          </Link>

          <form onSubmit={handleSearch} className="flex min-w-[12rem] flex-1 items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="search-field-light h-10 flex-1 border-0 shadow-sm"
              aria-label="Search products"
            />
            <Button type="submit" variant="accent" size="sm" className="shrink-0">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-on-brand sm:inline">
                  Hi, <strong>{user?.name?.split(' ')[0]}</strong>
                </span>
                <Button type="button" variant="onBrand" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="onBrand" size="sm" asChild>
                <Link to="/login" className="no-underline hover:no-underline">
                  Sign in
                </Link>
              </Button>
            )}

            <Button variant="accent" size="sm" className="relative font-bold" asChild>
              <Link to={isAuthenticated ? '/cart' : '/login'} className="no-underline hover:no-underline">
                🛒 Cart
                {cartQty > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-dark px-1 text-[10px] font-bold text-on-brand ring-2 ring-accent">
                    {cartQty}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        <nav className="border-t border-white/20 bg-brand-dark" aria-label="Shop aisles">
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              All Products
            </NavLink>
            {navAisles.map((aisle) => (
              <NavLink
                key={aisle.id}
                to={`/products?superCategoryId=${aisle.id}`}
                className={navLinkClass}
              >
                {aisle.name}
              </NavLink>
            ))}
            {isAuthenticated && (
              <>
                <NavLink to="/wishlist" className={navLinkClass}>
                  Wishlist
                </NavLink>
                <NavLink to="/orders" className={navLinkClass}>
                  Orders
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 font-bold text-card-foreground">{storeName}</p>
            <p className="m-0 mt-1 text-sm text-muted-foreground">
              Quality products at honest prices.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-card-foreground">
            <Link to="/products">Shop</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/login">Account</Link>
          </div>
          <ThemeSwitcher />
        </div>
        <div className="border-t border-border py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {storeName}
        </div>
      </footer>
    </div>
  );
}
