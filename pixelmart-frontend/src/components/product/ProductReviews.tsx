import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const MAX_REVIEW_IMAGES = 3;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { t } = useTranslation();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { data: reviews = [], isLoading } = useGetProductReviewsQuery(productId);
  const { data: myReview } = useGetMyReviewQuery(productId, { skip: !isAuthenticated });
  const { data: orders = [] } = useGetOrdersQuery(undefined, { skip: !isAuthenticated });
  const [submitReview, { isLoading: submitting }] = useSubmitReviewMutation();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const hasDeliveredPurchase = orders.some(
    (order) =>
      order.status === 'DELIVERED' &&
      order.items.some((item) => item.productId === productId),
  );
  const canSubmit = isAuthenticated && hasDeliveredPurchase && !myReview;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_REVIEW_IMAGES);
    setImages(files);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await submitReview({
        productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
        images: images.length > 0 ? images : undefined,
      }).unwrap();
      setTitle('');
      setBody('');
      setImages([]);
      setMessage(t('reviews.submitted'));
    } catch {
      setMessage(t('reviews.submitFailed'));
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t('product.reviews')}</h2>

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
              {(review.images ?? []).length > 0 && (
                <div className={styles.reviewImages}>
                  {review.images.map((image) => (
                    <a
                      key={image.id}
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.reviewImageLink}
                    >
                      <img src={image.url} alt={t('reviews.photo')} className={styles.reviewImage} />
                    </a>
                  ))}
                </div>
              )}
              <p className={styles.reviewMeta}>
                {formatDate(review.createdAt)}
                {review.verifiedPurchase && ` · ${t('reviews.verified')}`}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{t('reviews.empty')}</p>
      )}

      {isAuthenticated && myReview && (
        <p className={styles.notice}>
          {myReview.status === 'PENDING' && t('reviews.pending')}
          {myReview.status === 'REJECTED' && t('reviews.rejected')}
          {myReview.status === 'APPROVED' && t('reviews.approved')}
        </p>
      )}

      {canSubmit && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3>{t('reviews.write')}</h3>
          <p className={styles.hint}>{t('reviews.hint')}</p>
          <label>
            {t('reviews.rating')}
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {t(value === 1 ? 'reviews.star' : 'reviews.stars', { count: value })}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('reviews.title')}
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} />
          </label>
          <label>
            {t('reviews.body')}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              maxLength={2000}
              rows={4}
            />
          </label>
          <label>
            {t('reviews.photos', { count: MAX_REVIEW_IMAGES })}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleImageChange}
            />
            {images.length > 0 && (
              <span className={styles.hint}>{t('reviews.photosSelected', { count: images.length })}</span>
            )}
          </label>
          <button type="submit" className={styles.submitBtn} disabled={submitting || !body.trim()}>
            {submitting ? t('reviews.submitting') : t('reviews.submit')}
          </button>
          {message && <p className={styles.message}>{message}</p>}
        </form>
      )}
    </section>
  );
}
