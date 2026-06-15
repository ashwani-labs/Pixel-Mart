import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { FALLBACK_SUPER_CATEGORIES } from '../../lib/catalogFallbacks';
import { useGetSuperCategoriesQuery } from '../../store/api/catalogApi';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const HELP_LINKS = [
  { label: 'Shipping & delivery', to: '/shipping' },
  { label: 'Returns & refunds', to: '/returns' },
  { label: 'FAQs', to: '/faq' },
] as const;

const LEGAL_LINKS = [
  { label: 'Privacy policy', to: '/privacy' },
  { label: 'Terms of use', to: '/terms' },
] as const;

const PAYMENT_BADGES = ['UPI', 'Cards', 'Net Banking', 'COD'] as const;

export function StoreFooter() {
  const storeName = useSelector((s: RootState) => s.settings.storeName);
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { data: superCategories } = useGetSuperCategoriesQuery();
  const aisles = superCategories?.length ? superCategories : FALLBACK_SUPER_CATEGORIES;

  const footerLink =
    'text-sm text-muted-foreground no-underline transition hover:text-primary hover:no-underline';

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="m-0 text-lg font-bold text-card-foreground">{storeName}</p>
            <p className="m-0 mt-2 text-sm leading-relaxed text-muted-foreground">
              Your neighbourhood value store — groceries, electronics, fashion and home essentials
              at honest prices.
            </p>
            <p className="m-0 mt-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Need help?</span>
              <br />
              <a href="mailto:support@pixelmart.local" className={footerLink}>
                support@pixelmart.local
              </a>
            </p>
          </div>

          <div>
            <h3 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
              Shop aisles
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              <li>
                <Link to="/products" className={footerLink}>
                  All products
                </Link>
              </li>
              {aisles.map((aisle) => (
                <li key={aisle.id}>
                  <Link to={`/products?superCategoryId=${aisle.id}`} className={footerLink}>
                    {aisle.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
              My account
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/orders" className={footerLink}>
                      My orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" className={footerLink}>
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className={footerLink}>
                      Cart
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className={footerLink}>
                      Profile & addresses
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className={footerLink}>
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className={footerLink}>
                      Create account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
              Customer care
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {HELP_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {LEGAL_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="text-sm text-muted-foreground">
                  GST-inclusive pricing on eligible items
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          We accept
        </span>
        {PAYMENT_BADGES.map((badge) => (
          <span
            key={badge}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="bg-brand-dark py-4 text-center text-xs text-on-brand/90">
        <p className="m-0">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
        <p className="m-0 mt-1 opacity-80">
          Prices and offers may change without notice. Images are for illustration only.
        </p>
      </div>
    </footer>
  );
}
