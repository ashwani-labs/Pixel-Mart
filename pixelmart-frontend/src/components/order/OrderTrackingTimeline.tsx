import { useTranslation } from 'react-i18next';
import styles from './OrderTrackingTimeline.module.css';

const STEPS: Array<{ key: string; labelKey: string; statuses: string[] }> = [
  { key: 'PLACED', labelKey: 'orders.placedStep', statuses: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] },
  { key: 'CONFIRMED', labelKey: 'status.CONFIRMED', statuses: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
  { key: 'SHIPPED', labelKey: 'status.SHIPPED', statuses: ['SHIPPED', 'DELIVERED'] },
  { key: 'DELIVERED', labelKey: 'status.DELIVERED', statuses: ['DELIVERED'] },
];

interface OrderTrackingTimelineProps {
  status: string;
  trackingNumber: string | null;
  orderNumber: string;
}

export function OrderTrackingTimeline({ status, trackingNumber, orderNumber }: OrderTrackingTimelineProps) {
  const { t } = useTranslation();
  if (status === 'CANCELLED') {
    return (
      <div className={styles.cancelled} role="status">
        {t('orders.cancelled')}
      </div>
    );
  }

  const activeIndex = STEPS.findIndex((step) => step.statuses.includes(status));
  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div className={styles.wrap}>
      <p className={styles.tracking}>
        {t('orders.trackingId')} <strong>{trackingNumber ?? orderNumber}</strong>
      </p>
      <ol className={styles.timeline}>
        {STEPS.map((step, index) => {
          const done = index <= resolvedIndex;
          const current = index === resolvedIndex;
          return (
            <li key={step.key} className={`${styles.step} ${done ? styles.done : ''} ${current ? styles.current : ''}`}>
              <span className={styles.dot} aria-hidden />
              <span className={styles.label}>{t(step.labelKey)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
