import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useGetOrdersQuery } from '../store/api/orderApi';
import styles from './OrderDetailPage.module.css';

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function OrdersListPage() {
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: orders, isLoading, isError } = useGetOrdersQuery();

  if (isLoading) {
    return <p className={styles.muted}>Loading your orders…</p>;
  }

  if (isError) {
    return <p className={styles.muted}>Could not load orders.</p>;
  }

  return (
    <div className={styles.page}>
      <h1>My orders</h1>
      {!orders || orders.length === 0 ? (
        <>
          <p className={styles.muted}>You have not placed any orders yet.</p>
          <Link to="/products">Browse products</Link>
        </>
      ) : (
        <ul className={styles.orderList}>
          {orders.map((order) => (
            <li key={order.id} className={styles.card}>
              <div className={styles.orderRow}>
                <div>
                  <Link to={`/orders/${order.id}`} className={styles.orderLink}>
                    {order.orderNumber}
                  </Link>
                  <p className={styles.muted}>
                    {formatDate(order.createdAt, marketLocale)} · {order.status}
                  </p>
                </div>
                <strong>{formatPrice(order.grandTotal, marketLocale, marketCurrencyCode)}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
