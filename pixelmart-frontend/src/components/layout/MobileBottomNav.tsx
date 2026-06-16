import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { guestCartSummary, getGuestCart } from '@/lib/guestCart';
import type { RootState } from '@/store';
import { useGetCartQuery } from '@/store/api/orderApi';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/products', label: 'Shop', icon: '🛍️', end: false },
  { to: '/cart', label: 'Cart', icon: '🛒', end: false },
  { to: '/account', label: 'Account', icon: '👤', end: false },
] as const;

export function MobileBottomNav() {
  const location = useLocation();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const cartQty = isAuthenticated
    ? (cart?.totalQuantity ?? 0)
    : guestCartSummary(getGuestCart()).totalQuantity;

  const accountPath = isAuthenticated ? '/orders' : '/login';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="m-0 flex list-none items-stretch justify-around p-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {NAV_ITEMS.map((item) => {
          const to = item.label === 'Account' ? accountPath : item.to;
          const isActive = item.end ? location.pathname === to : location.pathname.startsWith(to);
          const badge = item.label === 'Cart' && cartQty > 0 ? cartQty : null;

          return (
            <li key={item.label} className="flex flex-1">
              <Link
                to={to}
                className={`relative flex flex-1 flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium no-underline hover:no-underline ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="relative text-lg leading-none" aria-hidden>
                  {item.icon}
                  {badge != null && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
