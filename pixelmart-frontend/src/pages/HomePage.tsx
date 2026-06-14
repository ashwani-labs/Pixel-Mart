import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/storefront/ProductCard';
import { getCategoryVisual } from '@/lib/categoryStyle';
import {
  useGetActiveOffersQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from '../store/api/catalogApi';
import type { RootState } from '../store';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const FALLBACK_CATEGORIES = [
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics' },
  { id: 'cat-fashion', name: 'Fashion', slug: 'fashion' },
  { id: 'cat-home', name: 'Home & Living', slug: 'home-living' },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function HomePage() {
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { data: categories } = useGetCategoriesQuery();
  const { data: featured, isLoading } = useGetProductsQuery({ page: 0, size: 12, featured: true });
  const { data: activeOffers } = useGetActiveOffersQuery();
  const displayCategories = categories?.length ? categories : FALLBACK_CATEGORIES;

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-brand-dark px-6 py-8 text-on-brand shadow-md sm:px-10">
        <Badge variant="deal" className="mb-3">
          Everyday savings
        </Badge>
        <h1 className="m-0 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
          Shop smarter. Save more.
        </h1>
        <p className="mt-2 max-w-md text-sm opacity-90 sm:text-base">
          Electronics, fashion and home essentials — clear pricing, fast checkout.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="accent" size="lg" asChild>
            <Link to="/products" className="no-underline hover:no-underline">
              Browse products
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button variant="onBrand" size="lg" asChild>
              <Link to="/register" className="no-underline hover:no-underline">
                Join free
              </Link>
            </Button>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {displayCategories.map((cat) => (
          <Button key={cat.id} variant="outline" size="sm" asChild>
            <Link to={`/products?categoryId=${cat.id}`} className="no-underline hover:no-underline">
              {getCategoryVisual(cat.id).emoji} {cat.name}
            </Link>
          </Button>
        ))}
      </div>

      {activeOffers && activeOffers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeOffers.map((offer) => (
            <span
              key={offer.id}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground"
            >
              <Badge variant="deal">Deal</Badge>
              {offer.name}
              {offer.couponCode && (
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">
                  {offer.couponCode}
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-lg font-bold text-foreground">Popular picks</h2>
          <Link to="/products" className="text-sm font-semibold text-primary no-underline hover:underline">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-shimmer rounded-xl bg-gradient-to-r from-muted via-card to-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {featured?.content.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="m-0 mb-4 text-lg font-bold text-foreground">Shop by category</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {displayCategories.map((cat) => {
            const visual = getCategoryVisual(cat.id);
            return (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="no-underline hover:no-underline"
              >
                <Card className="transition hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-5">
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${visual.gradient}`}
                    >
                      {visual.emoji}
                    </span>
                    <div>
                      <p className="m-0 font-bold text-card-foreground">{cat.name}</p>
                      <p className="m-0 mt-0.5 text-xs text-muted-foreground">Browse aisle →</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
