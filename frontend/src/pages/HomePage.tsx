import { Link } from 'react-router-dom';
import { useGetCategoriesQuery, useGetProductsQuery } from '../store/api/catalogApi';
import styles from './HomePage.module.css';
import productStyles from './ProductsPage.module.css';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function HomePage() {
  const { data: categories } = useGetCategoriesQuery();
  const { data: featured, isLoading } = useGetProductsQuery({ page: 0, size: 8, featured: true });

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Production-grade e-commerce</p>
        <h1>Welcome to the store</h1>
        <p className={styles.lead}>
          Discover curated electronics, fashion, and home essentials. Branding and product images are
          admin-configurable.
        </p>
        <Link to="/products" className={styles.cta}>
          Shop all products
        </Link>
      </section>

      {categories && categories.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shop by category</h2>
          <div className={productStyles.filters}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className={productStyles.chip}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured products</h2>
          <Link to="/products">View all →</Link>
        </div>
        {isLoading ? (
          <div className={productStyles.grid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={productStyles.skeleton} />
            ))}
          </div>
        ) : (
          <div className={productStyles.grid}>
            {featured?.content.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className={productStyles.card}
              >
                <div className={productStyles.cardImage}>◆</div>
                <div className={productStyles.cardBody}>
                  <h3 className={productStyles.cardName}>{product.name}</h3>
                  <div className={productStyles.priceRow}>
                    <span className={productStyles.price}>{formatPrice(product.basePrice)}</span>
                    {product.compareAtPrice && (
                      <span className={productStyles.compare}>
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
