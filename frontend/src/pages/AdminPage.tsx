import { Link } from 'react-router-dom';
import { useMeQuery } from '../store/api/authApi';
import styles from './PlaceholderPage.module.css';

export function AdminPage() {
  const { data: me, isLoading } = useMeQuery();

  return (
    <div className={styles.page}>
      <h1>Admin</h1>
      {isLoading ? (
        <p>Loading profile…</p>
      ) : me ? (
        <p>
          Signed in as <strong>{me.email}</strong> ({me.roles.join(', ')})
        </p>
      ) : null}
      <p>Full MUI admin console lands on Day 5+.</p>
      <Link to="/">← Back home</Link>
    </div>
  );
}
