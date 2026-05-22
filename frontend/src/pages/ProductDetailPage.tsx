import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { useGetProductBySlugQuery } from '../store/api/catalogApi';
import { useAddCartItemMutation } from '../store/api/orderApi';
import type { RootState } from '../store';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import styles from './ProductsPage.module.css';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function ProductDetailPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug ?? '', {
    skip: !slug,
  });
  const [addToCart, { isLoading: adding }] = useAddCartItemMutation();
  const [cartMessage, setCartMessage] = useState<string | null>(null);

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
          <button
            type="button"
            className={styles.addBtnActive}
            disabled={adding || product.stockQty < 1}
            onClick={async () => {
              setCartMessage(null);
              if (!isAuthenticated) {
                navigate('/login', { state: { from: `/products/${slug}` } });
                return;
              }
              try {
                await addToCart({ productId: product.id, quantity: 1 }).unwrap();
                setCartMessage('Added to cart.');
              } catch {
                setCartMessage('Could not add to cart.');
              }
            }}
          >
            {adding ? 'Adding…' : 'Add to cart'}
          </button>
          {cartMessage && <p className={styles.cartMsg}>{cartMessage}</p>}
          {isAuthenticated && (
            <Link to="/cart" className={styles.viewCartLink}>
              View cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
