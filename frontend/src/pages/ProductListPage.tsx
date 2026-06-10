import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  useAddWishlistItemMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
} from '../store/api/catalogApi';
import type { RootState } from '../store';
import { selectIsAuthenticated } from '../store/slices/authSlice';
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-3xl font-bold">Shop all products</h1>
          <p className="mt-1 text-muted-foreground">
            {data ? `${data.totalElements} products` : 'Browse our catalog'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="product-search">
            Search products
          </label>
          <Input
            id="product-search"
            className="min-w-56"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          />
          <Button type="button" variant="outline" onClick={applySearch}>
            Search
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Button
          type="button"
          variant={!categoryId ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory(undefined)}
        >
          All
        </Button>
        {categories?.map((cat) => (
          <Button
            key={cat.id}
            type="button"
            variant={categoryId === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {isLoading || isFetching ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-shimmer rounded-xl bg-gradient-to-r from-muted via-card to-muted"
            />
          ))}
        </div>
      ) : data && data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {data.content.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                formatPrice={formatPrice}
                showWishlist={isAuthenticated}
                isWishlisted={wishlistIds.has(product.id)}
                onWishlistToggle={() =>
                  wishlistIds.has(product.id)
                    ? removeWishlistItem(product.id)
                    : addWishlistItem(product.id)
                }
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button type="button" variant="outline" disabled={page <= 0} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {data.totalPages}
            </span>
            <Button type="button" variant="outline" disabled={data.last} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          No products found. Try another category or search.
        </p>
      )}
    </div>
  );
}
