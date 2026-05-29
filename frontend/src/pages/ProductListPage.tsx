import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useAddWishlistItemMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
} from '../store/api/catalogApi';
import type { RootState } from '../store';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import styles from './ProductsPage.module.css';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function ProductListPage() {
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? '0');
  const [searchInput, setSearchInput] = useState(search);

  const { data: categories } = useGetCategoriesQuery();
  const { data: wishlist = [] } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addWishlistItem] = useAddWishlistItemMutation();
  const [removeWishlistItem] = useRemoveWishlistItemMutation();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    size: 12,
    categoryId,
    search: search || undefined,
  });
  const wishlistIds = new Set(wishlist.map((item) => item.id));

  const applySearch = () => {
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('search', searchInput.trim());
    } else {
      next.delete('search');
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const setCategory = (id?: string) => {
    const next = new URLSearchParams(searchParams);
    if (id) {
      next.set('categoryId', id);
    } else {
      next.delete('categoryId');
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Shop all products</h1>
          <p className={styles.subtitle}>
            {data ? `${data.totalElements} products` : 'Browse our catalog'}
          </p>
        </div>
        <div className={styles.filters}>
          <label className="sr-only" htmlFor="product-search">
            Search products
          </label>
          <input
            id="product-search"
            className={styles.search}
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          />
          <button type="button" className={styles.pageBtn} onClick={applySearch}>
            Search
          </button>
        </div>
      </div>

      <div className={styles.filters} role="group" aria-label="Filter by category">
        <button
          type="button"
          className={`${styles.chip} ${!categoryId ? styles.chipActive : ''}`}
          onClick={() => setCategory(undefined)}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.chip} ${categoryId === cat.id ? styles.chipActive : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading || isFetching ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : data && data.content.length > 0 ? (
        <>
          <div className={styles.grid}>
            {data.content.map((product) => (
              <div key={product.id} className={styles.card}>
                <Link to={`/products/${product.slug}`} className={styles.cardImage}>
                  ◆
                </Link>
                <div className={styles.cardBody}>
                  <div className={styles.cardTopRow}>
                    <div className={styles.badges}>
                      {product.featured && <span className={styles.badge}>Featured</span>}
                      {product.offerName && <span className={styles.offerBadge}>{product.offerName}</span>}
                    </div>
                    {isAuthenticated && (
                      <button
                        type="button"
                        className={styles.wishlistBtn}
                        aria-label={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        onClick={() =>
                          wishlistIds.has(product.id)
                            ? removeWishlistItem(product.id)
                            : addWishlistItem(product.id)
                        }
                      >
                        {wishlistIds.has(product.id) ? '♥' : '♡'}
                      </button>
                    )}
                  </div>
                  <Link to={`/products/${product.slug}`} className={styles.productNameLink}>
                    <h2 className={styles.cardName}>{product.name}</h2>
                  </Link>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatPrice(product.effectivePrice)}</span>
                    {product.compareAtPrice && (
                      <span className={styles.compare}>{formatPrice(product.compareAtPrice)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {page + 1} of {data.totalPages}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={data.last}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className={styles.empty}>No products found. Try another category or search.</p>
      )}
    </div>
  );
}
