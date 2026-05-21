import { Link, useParams } from 'react-router-dom';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { useGetProductBySlugQuery } from '../store/api/catalogApi';
import styles from './ProductsPage.module.css';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug ?? '', {
    skip: !slug,
  });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} style={{ minHeight: 320 }} />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Product not found.</p>
        <Link to="/products">← Back to products</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/products">← Back to products</Link>
      <div className={styles.pdpLayout}>
        <ProductImageGallery images={product.images} productName={product.name} />
        <div>
          {product.featured && <span className={styles.badge}>Featured</span>}
          <h1 className={styles.pdpTitle}>{product.name}</h1>
          <div className={styles.priceRow}>
            <span className={styles.price} style={{ fontSize: '1.5rem' }}>
              {formatPrice(product.basePrice)}
            </span>
            {product.compareAtPrice && (
              <span className={styles.compare}>{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          <p className={styles.pdpDesc}>{product.description ?? 'No description available.'}</p>
          <p className={styles.subtitle}>In stock: {product.stockQty}</p>
          <button type="button" className={styles.addBtn} disabled title="Available after cart (Day 6)">
            Add to cart — coming Day 6
          </button>
        </div>
      </div>
    </div>
  );
}
