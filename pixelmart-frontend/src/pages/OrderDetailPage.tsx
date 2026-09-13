import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useCatalogLabel } from '@/i18n/catalogI18n';
import type { RootState } from '../store';
import { OrderTrackingTimeline } from '../components/order/OrderTrackingTimeline';
import { useGetOrderQuery } from '../store/api/orderApi';
import styles from './OrderDetailPage.module.css';

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function OrderDetailPage() {
  const { t } = useTranslation();
  const catalogName = useCatalogLabel();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const checkedOut = Boolean((location.state as { checkedOut?: boolean } | null)?.checkedOut);
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: order, isLoading, isError } = useGetOrderQuery(id ?? '', { skip: !id });

  if (isLoading) {
    return <p className={styles.muted}>{t('orders.loadingOne')}</p>;
  }

  if (isError || !order) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>{t('orders.notFound')}</p>
        <Link to="/products">{t('cart.continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {checkedOut && <div className={styles.success}>{t('orders.placed')}</div>}
      <Link to="/orders" className={styles.back}>
        {t('orders.back')}
      </Link>
      <section className={styles.card}>
        <h1>{t('orders.orderN', { number: order.orderNumber })}</h1>
        <OrderTrackingTimeline
          status={order.status}
          trackingNumber={order.trackingNumber}
          orderNumber={order.orderNumber}
        />
        <p className={styles.muted}>
          {t('orders.payment')} <strong>{t(`status.${order.payment.status}`, { defaultValue: order.payment.status })}</strong>
        </p>
        <p className={styles.muted}>
          {t('orders.method')} {order.payment.method.replace('MOCK_', '')} · {t('orders.ref')}{' '}
          {order.payment.providerReference}
        </p>
      </section>

      <section className={styles.card}>
        <h2>{t('orders.items')}</h2>
        <ul className={styles.items}>
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.productSlug}`}>
              <span>
                {catalogName(item.productName)} × {item.quantity}
              </span>
              <strong>{formatPrice(item.lineTotal, marketLocale, marketCurrencyCode)}</strong>
            </li>
          ))}
        </ul>
        <div className={styles.totals}>
          <p>
            <span>{t('checkout.subtotal')}</span>
            <strong>{formatPrice(order.subtotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
          {order.discountTotal > 0 && (
            <p>
              <span>{catalogName(order.discountLabel) || t('checkout.cartDiscount')}</span>
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
            <span>{t('checkout.total')}</span>
            <strong>{formatPrice(order.grandTotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <h2>{t('orders.shippingAddress')}</h2>
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
