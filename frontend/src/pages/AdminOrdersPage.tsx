import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} from '../store/api/orderApi';
import styles from './PlaceholderPage.module.css';
import formStyles from './AdminProductsPage.module.css';
import orderStyles from './OrderDetailPage.module.css';

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function AdminOrdersPage() {
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: orders, isLoading } = useGetAdminOrdersQuery();
  const [updateStatus] = useUpdateAdminOrderStatusMutation();
  const [message, setMessage] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, status: string) => {
    setMessage(null);
    try {
      await updateStatus({ id: orderId, status }).unwrap();
      setMessage('Order status updated.');
    } catch {
      setMessage('Could not update order status.');
    }
  };

  return (
    <div className={styles.page}>
      <h1>Admin — Orders</h1>
      <p>Review all customer orders and update fulfillment status.</p>
      {message && <p className={formStyles.message}>{message}</p>}

      {isLoading ? (
        <p>Loading orders…</p>
      ) : orders && orders.length > 0 ? (
        <ul className={formStyles.list}>
          {orders.map((order) => (
            <li key={order.id}>
              <div className={orderStyles.orderRow}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <span>
                    {order.shipToName} · {formatPrice(order.grandTotal, marketLocale, marketCurrencyCode)}
                  </span>
                </div>
                <label>
                  Status
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders yet.</p>
      )}

      <Link to="/admin">← Admin home</Link>
    </div>
  );
}
