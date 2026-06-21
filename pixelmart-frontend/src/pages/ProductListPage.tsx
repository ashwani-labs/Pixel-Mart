import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const featured = searchParams.get('featured') === 'true';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const onSaleOnly = searchParams.get('onSaleOnly') === 'true';
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const page = Number(searchParams.get('page') ?? '0');
  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice?.toString() ?? '');
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice?.toString() ?? '');

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
    featured: featured || undefined,
    sort,
    minPrice,
    maxPrice,
    inStockOnly: inStockOnly || undefined,
    onSaleOnly: onSaleOnly || undefined,
    minRating,
  });
  const { data: featuredFallback } = useGetProductsQuery(
    { page: 0, size: 4, featured: true },
    { skip: !data || data.content.length > 0 || isLoading },
  );
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

  const applyPriceFilters = () => {
    const next = new URLSearchParams(searchParams);
    const min = minPriceInput.trim() ? Number(minPriceInput) : undefined;
    const max = maxPriceInput.trim() ? Number(maxPriceInput) : undefined;
    if (min != null && !Number.isNaN(min) && min >= 0) {
      next.set('minPrice', String(min));
    } else {
      next.delete('minPrice');
    }
    if (max != null && !Number.isNaN(max) && max >= 0) {
      next.set('maxPrice', String(max));
    } else {
      next.delete('maxPrice');
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const setInStockOnly = (checked: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (checked) {
      next.set('inStockOnly', 'true');
    } else {
      next.delete('inStockOnly');
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const setOnSaleOnly = (checked: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (checked) {
      next.set('onSaleOnly', 'true');
    } else {
      next.delete('onSaleOnly');
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const setMinRating = (value?: number) => {
    const next = new URLSearchParams(searchParams);
    if (value != null && value > 0) {
      next.set('minRating', String(value));
    } else {
      next.delete('minRating');
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  };

  const pageTitle = featured
    ? 'Featured products'
    : activeSubCategory?.name ?? activeSuperCategory?.name ?? 'All products';

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

          <div className="mt-6 border-t border-border pt-4">
            <h2 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Price range (₹)
            </h2>
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="h-9"
                aria-label="Minimum price"
              />
              <Input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="h-9"
                aria-label="Maximum price"
              />
              <Button type="button" size="sm" variant="outline" onClick={applyPriceFilters}>
                Apply
              </Button>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              In stock only
            </label>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              On sale only
            </label>
            <div className="mt-4">
              <h3 className="m-0 mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Minimum rating
              </h3>
              <Select
                className="h-9 w-full"
                value={minRating != null ? String(minRating) : ''}
                onChange={(e) =>
                  setMinRating(e.target.value ? Number(e.target.value) : undefined)
                }
                aria-label="Minimum rating filter"
              >
                <option value="">Any rating</option>
                <option value="3">3★ & up</option>
                <option value="4">4★ & up</option>
                <option value="5">5★ only</option>
              </Select>
            </div>
          </div>
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
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <p className="m-0 text-lg font-semibold text-foreground">No products found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? `We couldn't find anything matching “${search}”.`
                : 'Try adjusting filters or browse another aisle.'}
            </p>
            <Button type="button" variant="outline" className="mt-4" onClick={clearAllFilters}>
              Clear filters
            </Button>

            {(featuredFallback?.content.length ?? 0) > 0 && (
              <div className="mt-10 text-left">
                <h2 className="m-0 mb-4 text-lg font-bold text-foreground">Popular picks</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {featuredFallback!.content.map((product) => (
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
              </div>
            )}

            {superCategories.length > 0 && (
              <div className="mt-8">
                <p className="m-0 mb-3 text-sm font-semibold text-muted-foreground">Browse aisles</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {superCategories.slice(0, 4).map((aisle) => (
                    <Button key={aisle.id} variant="outline" size="sm" asChild>
                      <Link to={`/products?superCategoryId=${aisle.id}`}>
                        {getCategoryVisual(aisle.id).emoji} {aisle.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
