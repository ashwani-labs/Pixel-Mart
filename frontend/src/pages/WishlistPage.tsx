import { Link } from 'react-router-dom';
import { useGetWishlistQuery, useRemoveWishlistItemMutation } from '../store/api/catalogApi';
import styles from './ProductsPage.module.css';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function WishlistPage() {
  const { data: wishlist = [], isLoading, isFetching } = useGetWishlistQuery();
  const [removeWishlistItem] = useRemoveWishlistItemMutation();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My wishlist</h1>
          <p className={styles.subtitle}>{wishlist.length} saved items</p>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className={styles.grid}>
          {wishlist.map((product) => (
            <div key={product.id} className={styles.card}>
              <Link to={`/products/${product.slug}`} className={styles.cardImage}>
                ◆
              </Link>
              <div className={styles.cardBody}>
                <h2 className={styles.cardName}>{product.name}</h2>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{formatPrice(product.effectivePrice)}</span>
                  {product.compareAtPrice && (
                    <span className={styles.compare}>{formatPrice(product.compareAtPrice)}</span>
                  )}
                </div>
                <div className={styles.wishlistActions}>
                  <Link to={`/products/${product.slug}`} className={styles.pageBtn}>
                    View
                  </Link>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => removeWishlistItem(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.empty}>Your wishlist is empty.</p>
          <Link to="/products" className={styles.pageBtn}>
            Browse products
          </Link>
        </div>
      )}
    </div>
  );
}
