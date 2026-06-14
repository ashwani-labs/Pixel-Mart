import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetMyReviewQuery,
  useGetProductReviewsQuery,
  useSubmitReviewMutation,
} from '../../store/api/catalogApi';
import { useGetOrdersQuery } from '../../store/api/orderApi';
import type { RootState } from '../../store';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import styles from './ProductReviews.module.css';

interface ProductReviewsProps {
  productId: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { data: reviews = [], isLoading } = useGetProductReviewsQuery(productId);
  const { data: myReview } = useGetMyReviewQuery(productId, { skip: !isAuthenticated });
  const { data: orders = [] } = useGetOrdersQuery(undefined, { skip: !isAuthenticated });
  const [submitReview, { isLoading: submitting }] = useSubmitReviewMutation();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const hasDeliveredPurchase = orders.some(
    (order) =>
      order.status === 'DELIVERED' &&
      order.items.some((item) => item.productId === productId),
  );
  const canSubmit = isAuthenticated && hasDeliveredPurchase && !myReview;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await submitReview({
        productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      }).unwrap();
      setTitle('');
      setBody('');
      setMessage('Review submitted and pending moderation.');
    } catch {
      setMessage('Could not submit review. You may need a delivered order for this product.');
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Customer reviews</h2>

      {isLoading ? (
        <div className={styles.skeleton} />
      ) : reviews.length > 0 ? (
        <ul className={styles.list}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <strong>{review.reviewerName}</strong>
                <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              {review.title && <h3 className={styles.reviewTitle}>{review.title}</h3>}
              <p className={styles.reviewBody}>{review.body}</p>
              <p className={styles.reviewMeta}>
                {formatDate(review.createdAt)}
                {review.verifiedPurchase && ' · Verified purchase'}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No approved reviews yet.</p>
      )}

      {isAuthenticated && myReview && (
        <p className={styles.notice}>
          {myReview.status === 'PENDING' && 'Your review is pending moderation.'}
          {myReview.status === 'REJECTED' && 'Your review was not approved.'}
          {myReview.status === 'APPROVED' && 'Thanks — your review is published.'}
        </p>
      )}

      {canSubmit && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3>Write a review</h3>
          <p className={styles.hint}>Only available after this product is delivered on one of your orders.</p>
          <label>
            Rating
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value === 1 ? '' : 's'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title (optional)
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} />
          </label>
          <label>
            Review
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              maxLength={2000}
              rows={4}
            />
          </label>
          <button type="submit" className={styles.submitBtn} disabled={submitting || !body.trim()}>
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
          {message && <p className={styles.message}>{message}</p>}
        </form>
      )}
    </section>
  );
}
