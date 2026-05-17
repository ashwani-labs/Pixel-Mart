import { Link } from 'react-router-dom';
import styles from './PlaceholderPage.module.css';

export function AdminPage() {
  return (
    <div className={styles.page}>
      <h1>Admin</h1>
      <p>MUI admin console starts <strong>Week 1 Day 5+</strong>. Route guard on Day 3.</p>
      <Link to="/">← Back home</Link>
    </div>
  );
}
