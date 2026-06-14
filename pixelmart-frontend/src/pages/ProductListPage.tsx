import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/storefront/ProductCard';
import { getCategoryVisual } from '@/lib/categoryStyle';
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
    size: 16,
    categoryId,
    search: search || undefined,
  });
  const wishlistIds = new Set(wishlist.map((item) => item.id));
  const activeCategory = categories?.find((c) => c.id === categoryId);

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
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:w-56">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Departments
          </h2>
          <ul className="m-0 flex flex-row flex-wrap gap-2 p-0 lg:flex-col lg:gap-1">
            <li className="list-none">
              <Button
                type="button"
                variant={!categoryId ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setCategory(undefined)}
              >
                All products
              </Button>
            </li>
            {categories?.map((cat) => {
              const visual = getCategoryVisual(cat.id);
              return (
                <li key={cat.id} className="list-none">
                  <Button
                    type="button"
                    variant={categoryId === cat.id ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setCategory(cat.id)}
                  >
                    <span aria-hidden>{visual.emoji}</span>
                    {cat.name}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="m-0 text-2xl font-bold text-foreground">
                {activeCategory ? activeCategory.name : 'All products'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data ? `${data.totalElements} items` : 'Browse our value range'}
                {search && ` · “${search}”`}
              </p>
            </div>
            <div className="flex w-full max-w-md gap-0 sm:w-auto">
              <label className="sr-only" htmlFor="product-search">
                Search products
              </label>
              <Input
                id="product-search"
                className="h-10 flex-1 rounded-r-none"
                placeholder="Search in store…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              />
              <Button type="button" variant="accent" className="h-10 rounded-l-none px-4" onClick={applySearch}>
                Go
              </Button>
            </div>
          </div>
        </div>

        {isLoading || isFetching ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-card to-muted"
              />
            ))}
          </div>
        ) : data && data.content.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {data.content.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  formatPrice={formatPrice}
                  showWishlist={isAuthenticated}
                  showAddToCart
                  isWishlisted={wishlistIds.has(product.id)}
                  onWishlistToggle={() =>
                    wishlistIds.has(product.id)
                      ? removeWishlistItem(product.id)
                      : addWishlistItem(product.id)
                  }
                />
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button type="button" variant="outline" disabled={page <= 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                Page {page + 1} of {data.totalPages}
              </span>
              <Button type="button" variant="outline" disabled={data.last} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="m-0 text-lg font-semibold text-foreground">No products found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another aisle or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
