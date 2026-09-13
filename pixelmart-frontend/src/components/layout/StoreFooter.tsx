import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useCatalogLabel } from '../../i18n/catalogI18n';
import type { RootState } from '../../store';
import { FALLBACK_SUPER_CATEGORIES } from '../../lib/catalogFallbacks';
import { useGetSuperCategoriesQuery } from '../../store/api/catalogApi';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

export function StoreFooter() {
  const { t } = useTranslation();
  const catalogName = useCatalogLabel();
  const storeName = useSelector((s: RootState) => s.settings.storeName);
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { data: superCategories } = useGetSuperCategoriesQuery();
  const aisles = superCategories?.length ? superCategories : FALLBACK_SUPER_CATEGORIES;
  const helpLinks = [
    { label: t('footer.shipping'), to: '/shipping' },
    { label: t('footer.returns'), to: '/returns' },
    { label: t('footer.faqs'), to: '/faq' },
  ] as const;
  const legalLinks = [
    { label: t('footer.privacy'), to: '/privacy' },
    { label: t('footer.terms'), to: '/terms' },
  ] as const;
  const paymentBadges = [t('footer.upi'), t('footer.cards'), t('footer.netBanking'), t('footer.cod')];

  const footerLink =
    'text-sm text-muted-foreground no-underline transition hover:text-primary hover:no-underline';

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="border-b border-border bg-brand-subtle">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="m-0 text-lg font-bold text-card-foreground">{storeName}</p>
            <p className="m-0 mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('footer.tagline')}
            </p>
            <p className="m-0 mt-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{t('footer.needHelp')}</span>
              <br />
              <a href="mailto:support@pixelmart.local" className={footerLink}>
                support@pixelmart.local
              </a>
            </p>
          </div>

          <div>
            <h3 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
              {t('footer.shopAisles')}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              <li>
                <Link to="/products" className={footerLink}>
                  {t('nav.allProducts')}
                </Link>
              </li>
              {aisles.map((aisle) => (
                <li key={aisle.id}>
                  <Link to={`/products?superCategoryId=${aisle.id}`} className={footerLink}>
                    {catalogName(aisle.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
              {t('footer.myAccount')}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/orders" className={footerLink}>
                      {t('footer.myOrders')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" className={footerLink}>
                      {t('nav.wishlist')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className={footerLink}>
                      {t('nav.cart')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className={footerLink}>
                      {t('footer.profileAddresses')}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className={footerLink}>
                      {t('nav.signIn')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className={footerLink}>
                      {t('footer.createAccount')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
              {t('footer.customerCare')}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {helpLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="text-sm text-muted-foreground">
                  {t('footer.gstNote')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('footer.weAccept')}
        </span>
        {paymentBadges.map((badge) => (
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
          {t('footer.rights', { year: new Date().getFullYear(), store: storeName })}
        </p>
        <p className="m-0 mt-1 opacity-80">
          {t('footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
}
