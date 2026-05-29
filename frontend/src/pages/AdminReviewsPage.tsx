import { Link } from 'react-router-dom';
import { useGetAdminReviewsQuery, useModerateReviewMutation } from '../store/api/catalogApi';
import styles from './PlaceholderPage.module.css';
import formStyles from './AdminProductsPage.module.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export function AdminReviewsPage() {
  const { data, isLoading } = useGetAdminReviewsQuery({ status: 'PENDING' });
  const [moderateReview] = useModerateReviewMutation();

  return (
    <div className={styles.page}>
      <h1>Admin — Reviews</h1>
      <p>Approve or reject customer reviews before they appear on the storefront.</p>

      {isLoading ? (
        <p>Loading review queue…</p>
      ) : data && data.content.length > 0 ? (
        <div className={formStyles.uploadForm}>
          {data.content.map((review) => (
            <article key={review.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <p>
                <strong>{review.productName ?? review.productId}</strong> · {review.reviewerName}
              </p>
              <p>
                {'★'.repeat(review.rating)}
                {review.title ? ` — ${review.title}` : ''}
              </p>
              <p>{review.body}</p>
              <p className={styles.subtitle}>
                {formatDate(review.createdAt)}
                {review.verifiedPurchase ? ' · Verified purchase' : ''}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => moderateReview({ id: review.id, status: 'APPROVED' })}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => moderateReview({ id: review.id, status: 'REJECTED' })}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>No pending reviews.</p>
      )}

      <p>
        <Link to="/admin">← Back to admin</Link>
      </p>
    </div>
  );
}
