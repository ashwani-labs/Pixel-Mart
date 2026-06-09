import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useGetOrderQuery } from '../store/api/orderApi';
import styles from './OrderDetailPage.module.css';

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const checkedOut = Boolean((location.state as { checkedOut?: boolean } | null)?.checkedOut);
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: order, isLoading, isError } = useGetOrderQuery(id ?? '', { skip: !id });

  if (isLoading) {
    return <p className={styles.muted}>Loading order…</p>;
  }

  if (isError || !order) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Order not found.</p>
        <Link to="/products">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {checkedOut && <div className={styles.success}>Order placed successfully.</div>}
      <Link to="/orders" className={styles.back}>
        ← My orders
      </Link>
      <section className={styles.card}>
        <h1>Order {order.orderNumber}</h1>
        <p className={styles.muted}>
          Status: <strong>{order.status}</strong> · Payment: <strong>{order.payment.status}</strong>
        </p>
        <p className={styles.muted}>
          Method: {order.payment.method.replace('MOCK_', 'Mock ')} · Ref:{' '}
          {order.payment.providerReference}
        </p>
      </section>

      <section className={styles.card}>
        <h2>Items</h2>
        <ul className={styles.items}>
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.productSlug}`}>
              <span>
                {item.productName} × {item.quantity}
              </span>
              <strong>{formatPrice(item.lineTotal, marketLocale, marketCurrencyCode)}</strong>
            </li>
          ))}
        </ul>
        <div className={styles.totals}>
          <p>
            <span>Subtotal</span>
            <strong>{formatPrice(order.subtotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
          {order.discountTotal > 0 && (
            <p>
              <span>{order.discountLabel ?? 'Cart discount'}</span>
              <strong>-{formatPrice(order.discountTotal, marketLocale, marketCurrencyCode)}</strong>
            </p>
          )}
          <p>
            <span>
              {order.taxLabel} ({order.taxRatePercent}%)
            </span>
            <strong>{formatPrice(order.taxTotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
          <p className={styles.grandTotal}>
            <span>Total</span>
            <strong>{formatPrice(order.grandTotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <h2>Shipping address</h2>
        <p>{order.shipToName} · {order.shipToPhone}</p>
        <p>
          {order.shipAddressLine1}
          {order.shipAddressLine2 ? `, ${order.shipAddressLine2}` : ''}
        </p>
        <p>
          {order.shipCity}, {order.shipState} {order.shipPincode}
        </p>
      </section>
    </div>
  );
}
