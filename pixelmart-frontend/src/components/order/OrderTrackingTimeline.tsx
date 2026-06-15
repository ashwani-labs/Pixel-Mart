import styles from './OrderTrackingTimeline.module.css';

const STEPS: Array<{ key: string; label: string; statuses: string[] }> = [
  { key: 'PLACED', label: 'Order placed', statuses: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] },
  { key: 'CONFIRMED', label: 'Confirmed', statuses: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
  { key: 'SHIPPED', label: 'Shipped', statuses: ['SHIPPED', 'DELIVERED'] },
  { key: 'DELIVERED', label: 'Delivered', statuses: ['DELIVERED'] },
];

interface OrderTrackingTimelineProps {
  status: string;
  trackingNumber: string | null;
  orderNumber: string;
}

export function OrderTrackingTimeline({ status, trackingNumber, orderNumber }: OrderTrackingTimelineProps) {
  if (status === 'CANCELLED') {
    return (
      <div className={styles.cancelled} role="status">
        This order was cancelled.
      </div>
    );
  }

  const activeIndex = STEPS.findIndex((step) => step.statuses.includes(status));
  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div className={styles.wrap}>
      <p className={styles.tracking}>
        Tracking ID: <strong>{trackingNumber ?? orderNumber}</strong>
      </p>
      <ol className={styles.timeline}>
        {STEPS.map((step, index) => {
          const done = index <= resolvedIndex;
          const current = index === resolvedIndex;
          return (
            <li key={step.key} className={`${styles.step} ${done ? styles.done : ''} ${current ? styles.current : ''}`}>
              <span className={styles.dot} aria-hidden />
              <span className={styles.label}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
