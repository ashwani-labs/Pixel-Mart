import { Link } from 'react-router-dom';
import styles from './PlaceholderPage.module.css';

export function CheckoutPage() {
  return (
    <div className={styles.page}>
      <h1>Checkout</h1>
      <p>
        Checkout with addresses and mock payment lands on <strong>Day 8</strong>. Your cart is
        saved — complete the flow once checkout is live.
      </p>
      <p>
        <Link to="/cart">← Back to cart</Link>
      </p>
    </div>
  );
}
