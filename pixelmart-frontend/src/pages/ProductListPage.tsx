import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ProductCard } from '@/components/storefront/ProductCard';
import { getCategoryVisual } from '@/lib/categoryStyle';
import {
  useAddWishlistItemMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetSuperCategoriesQuery,
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
} from '../store/api/catalogApi';
import type { RootState } from '../store';
import { selectIsAuthenticated } from '../store/slices/authSlice';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

const SORT_OPTIONS = [
  { value: 'name,asc', label: 'Name A–Z' },
  { value: 'basePrice,asc', label: 'Price: Low to high' },
  { value: 'basePrice,desc', label: 'Price: High to low' },
] as const;

export function ProductListPage() {
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const superCategoryId = searchParams.get('superCategoryId') ?? undefined;
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'name,asc';
  const page = Number(searchParams.get('page') ?? '0');
  const [searchInput, setSearchInput] = useState(search);

  const { data: superCategories = [] } = useGetSuperCategoriesQuery();
  const { data: subCategories = [] } = useGetCategoriesQuery();
  const { data: wishlist = [] } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addWishlistItem] = useAddWishlistItemMutation();
  const [removeWishlistItem] = useRemoveWishlistItemMutation();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    size: 16,
    categoryId,
    superCategoryId: categoryId ? undefined : superCategoryId,
    search: search || undefined,
    sort,
  });
  const wishlistIds = new Set(wishlist.map((item) => item.id));

  const subCategoriesBySuper = useMemo(() => {
    const grouped = new Map<string, typeof subCategories>();
    for (const sub of subCategories) {
      if (!sub.parentId) continue;
      const list = grouped.get(sub.parentId) ?? [];
      list.push(sub);
      grouped.set(sub.parentId, list);
    }
    return grouped;
  }, [subCategories]);

  const activeSubCategory = subCategories.find((c) => c.id === categoryId);
  const activeSuperCategory = superCategories.find(
    (c) => c.id === superCategoryId || c.id === activeSubCategory?.parentId,
  );
  const resolvedSuperId = activeSuperCategory?.id ?? superCategoryId;

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

  const setFilters = (nextSuperId?: string, nextCategoryId?: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextSuperId) {
      next.set('superCategoryId', nextSuperId);
    } else {
      next.delete('superCategoryId');
    }
    if (nextCategoryId) {
      next.set('categoryId', nextCategoryId);
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

  const setSort = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', value);
    next.set('page', '0');
    setSearchParams(next);
  };

  const pageTitle = activeSubCategory?.name ?? activeSuperCategory?.name ?? 'All products';

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:w-60">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Departments
          </h2>
          <ul className="m-0 flex flex-col gap-1 p-0">
            <li className="list-none">
              <Button
                type="button"
                variant={!categoryId && !superCategoryId ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setFilters(undefined, undefined)}
              >
                All products
              </Button>
            </li>
            {superCategories.map((superCat) => {
              const visual = getCategoryVisual(superCat.id);
              const isSuperActive = resolvedSuperId === superCat.id && !categoryId;
              const children = subCategoriesBySuper.get(superCat.id) ?? [];
              const isExpanded = resolvedSuperId === superCat.id;

              return (
                <li key={superCat.id} className="list-none">
                  <Button
                    type="button"
                    variant={isSuperActive ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setFilters(superCat.id, undefined)}
                  >
                    <span aria-hidden>{visual.emoji}</span>
                    {superCat.name}
                  </Button>
                  {isExpanded && children.length > 0 && (
                    <ul className="m-0 mt-1 flex flex-col gap-0.5 border-l-2 border-border pl-2">
                      {children.map((sub) => (
                        <li key={sub.id} className="list-none">
                          <Button
                            type="button"
                            variant={categoryId === sub.id ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-full justify-start text-xs"
                            onClick={() => setFilters(superCat.id, sub.id)}
                          >
                            {sub.name}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
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
              <h1 className="m-0 text-2xl font-bold text-foreground">{pageTitle}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data ? `${data.totalElements} items` : 'Browse our value range'}
                {activeSuperCategory && activeSubCategory && ` · ${activeSuperCategory.name}`}
                {search && ` · “${search}”`}
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Sort
                <Select
                  className="h-10 min-w-[10rem]"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort products"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
              <div className="flex flex-1 gap-0">
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

          {resolvedSuperId && (subCategoriesBySuper.get(resolvedSuperId) ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                type="button"
                size="sm"
                variant={!categoryId ? 'default' : 'outline'}
                onClick={() => setFilters(resolvedSuperId, undefined)}
              >
                All in {activeSuperCategory?.name ?? 'aisle'}
              </Button>
              {(subCategoriesBySuper.get(resolvedSuperId) ?? []).map((sub) => (
                <Button
                  key={sub.id}
                  type="button"
                  size="sm"
                  variant={categoryId === sub.id ? 'default' : 'outline'}
                  onClick={() => setFilters(resolvedSuperId, sub.id)}
                >
                  {getCategoryVisual(sub.id).emoji} {sub.name}
                </Button>
              ))}
            </div>
          )}
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
