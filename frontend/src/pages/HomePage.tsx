import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  useGetActiveOffersQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from '../store/api/catalogApi';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function HomePage() {
  const { data: categories } = useGetCategoriesQuery();
  const { data: featured, isLoading } = useGetProductsQuery({ page: 0, size: 8, featured: true });
  const { data: activeOffers } = useGetActiveOffersQuery();

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-xl border border-border bg-gradient-to-br from-primary/15 to-card p-10">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Production-grade e-commerce
        </p>
        <h1 className="m-0 mb-3 text-4xl font-bold leading-tight">Welcome to the store</h1>
        <p className="mb-5 max-w-2xl text-muted-foreground">
          Discover curated electronics, fashion, and home essentials. Branding and product images are
          admin-configurable.
        </p>
        <Button asChild>
          <Link to="/products" className="no-underline hover:no-underline">
            Shop all products
          </Link>
        </Button>
      </section>

      {activeOffers && activeOffers.length > 0 && (
        <Card className="border-primary/35 bg-primary/10">
          <CardContent className="p-4">
            <strong>Deals live now:</strong> {activeOffers.map((offer) => offer.name).join(', ')}
          </CardContent>
        </Card>
      )}

      {categories && categories.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="m-0 text-xl font-semibold">Shop by category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button key={cat.id} variant="outline" size="sm" asChild>
                <Link to={`/products?categoryId=${cat.id}`} className="no-underline hover:no-underline">
                  {cat.name}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="m-0 text-xl font-semibold">Featured products</h2>
          <Link to="/products">View all →</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-shimmer rounded-xl bg-gradient-to-r from-muted via-card to-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {featured?.content.map((product) => (
              <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
