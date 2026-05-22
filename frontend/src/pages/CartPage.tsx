import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '../store/api/orderApi';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import styles from './CartPage.module.css';

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function CartPage() {
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: cart, isLoading, isError } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <p className={styles.loading}>Loading cart…</p>;
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Could not load your cart. Try again later.</p>
        <Link to="/products">Continue shopping</Link>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className={styles.page}>
      <h1>Your cart</h1>
      {items.length === 0 ? (
        <>
          <p className={styles.empty}>Your cart is empty.</p>
          <Link to="/products" className={styles.shopLink}>
            Browse products
          </Link>
        </>
      ) : (
        <>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.line}>
                <div className={styles.lineInfo}>
                  <Link to={`/products/${item.productSlug}`} className={styles.name}>
                    {item.productName}
                  </Link>
                  <p className={styles.unitPrice}>
                    {formatPrice(item.unitPrice, marketLocale, marketCurrencyCode)} each
                  </p>
                </div>
                <div className={styles.lineActions}>
                  <label className={styles.qtyLabel}>
                    Qty
                    <input
                      type="number"
                      min={1}
                      className={styles.qtyInput}
                      value={item.quantity}
                      onChange={async (e) => {
                        const qty = parseInt(e.target.value, 10);
                        if (qty >= 1) {
                          await updateItem({ id: item.id, body: { quantity: qty } });
                        }
                      }}
                    />
                  </label>
                  <span className={styles.lineTotal}>
                    {formatPrice(item.lineTotal, marketLocale, marketCurrencyCode)}
                  </span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.summary}>
            <p>
              <strong>Subtotal</strong>{' '}
              {formatPrice(cart!.subtotal, marketLocale, marketCurrencyCode)}
            </p>
            <p className={styles.hint}>{cart!.totalQuantity} item(s) in cart</p>
            <Link to="/checkout" className={styles.checkoutBtn}>
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
