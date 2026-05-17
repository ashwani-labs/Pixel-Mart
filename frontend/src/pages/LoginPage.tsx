import { Link } from 'react-router-dom';
import styles from './PlaceholderPage.module.css';

export function LoginPage() {
  return (
    <div className={styles.page}>
      <h1>Login</h1>
      <p>Auth forms land on <strong>Week 1 Day 2</strong> (register, login, JWT).</p>
      <Link to="/">← Back home</Link>
    </div>
  );
}
