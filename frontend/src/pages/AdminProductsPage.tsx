import { Link } from 'react-router-dom';
import styles from './PlaceholderPage.module.css';

export function AdminProductsPage() {
  return (
    <div className={styles.page}>
      <h1>Admin — Products</h1>
      <p>
        Full product DataGrid and CRUD forms land on <strong>Day 5</strong>. Use admin APIs via
        curl/Postman for now.
      </p>
      <p>
        Example: <code>GET /api/admin/products</code> with <code>Authorization: Bearer</code> and
        gateway headers for an admin user.
      </p>
      <Link to="/admin">← Admin home</Link>
    </div>
  );
}
