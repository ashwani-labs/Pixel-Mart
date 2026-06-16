import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroCarousel } from '@/components/storefront/HeroCarousel';
import { useGetHeroSlidesQuery } from '../store/api/settingsApi';
import { ProductCard } from '@/components/storefront/ProductCard';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { FALLBACK_SUPER_CATEGORIES } from '@/lib/catalogFallbacks';
import { getCategoryVisual } from '@/lib/categoryStyle';
import {
  useGetActiveOffersQuery,
  useGetProductsQuery,
  useGetSuperCategoriesQuery,
} from '../store/api/catalogApi';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

const SPOTLIGHT_AISLES = ['super-grocery', 'super-electronics', 'super-fashion'] as const;

export function HomePage() {
  const { data: heroSlides } = useGetHeroSlidesQuery();
  const { data: superCategories } = useGetSuperCategoriesQuery();
  const { data: featured, isLoading } = useGetProductsQuery({ page: 0, size: 12, featured: true });
  const { data: groceryDeals } = useGetProductsQuery({
    page: 0,
    size: 6,
    superCategoryId: 'super-grocery',
    sort: 'basePrice,asc',
  });
  const { data: activeOffers } = useGetActiveOffersQuery();
  const aisles = superCategories?.length ? superCategories : FALLBACK_SUPER_CATEGORIES;
  const spotlightAisles = aisles.filter((a) =>
    SPOTLIGHT_AISLES.includes(a.id as (typeof SPOTLIGHT_AISLES)[number]),
  );

  return (
    <div className="flex flex-col gap-8">
      <HeroCarousel slides={heroSlides?.slides} />

      <RecentlyViewed formatPrice={formatPrice} />

      {spotlightAisles.length > 0 && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {spotlightAisles.map((aisle) => {
            const visual = getCategoryVisual(aisle.id);
            return (
              <Link
                key={aisle.id}
                to={`/products?superCategoryId=${aisle.id}`}
                className="no-underline hover:no-underline"
              >
                <Card className="h-full border-primary/20 bg-gradient-to-br from-card to-muted/30 transition hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${visual.gradient}`}
                    >
                      {visual.emoji}
                    </span>
                    <div>
                      <p className="m-0 font-bold text-card-foreground">{aisle.name}</p>
                      <p className="m-0 mt-0.5 text-xs text-primary">Shop now →</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {aisles.map((aisle) => (
          <Button key={aisle.id} variant="outline" size="sm" asChild>
            <Link
              to={`/products?superCategoryId=${aisle.id}`}
              className="no-underline hover:no-underline"
            >
              {getCategoryVisual(aisle.id).emoji} {aisle.name}
            </Link>
          </Button>
        ))}
      </div>

      {activeOffers && activeOffers.length > 0 && (
        <section>
          <h2 className="m-0 mb-3 text-lg font-bold text-foreground">Today&apos;s deals</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {activeOffers.map((offer) => (
              <Card
                key={offer.id}
                className="min-w-[220px] shrink-0 border-deal-foreground/20 bg-deal/30"
              >
                <CardContent className="flex flex-col gap-2 p-4">
                  <Badge variant="deal">Deal</Badge>
                  <p className="m-0 font-semibold text-card-foreground">{offer.name}</p>
                  {offer.couponCode ? (
                    <p className="m-0 text-xs text-muted-foreground">
                      Use code{' '}
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-primary">
                        {offer.couponCode}
                      </span>
                    </p>
                  ) : (
                    <p className="m-0 text-xs text-muted-foreground">Auto-applied at checkout</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
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
              <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
            ))}
          </div>
        )}
      </section>

      {groceryDeals && groceryDeals.content.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-lg font-bold text-foreground">Value grocery picks</h2>
            <Link
              to="/products?superCategoryId=super-grocery"
              className="text-sm font-semibold text-primary no-underline hover:underline"
            >
              All groceries →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {groceryDeals.content.map((product) => (
              <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="m-0 mb-4 text-lg font-bold text-foreground">Shop by aisle</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {aisles.map((aisle) => {
            const visual = getCategoryVisual(aisle.id);
            return (
              <Link
                key={aisle.id}
                to={`/products?superCategoryId=${aisle.id}`}
                className="no-underline hover:no-underline"
              >
                <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${visual.gradient}`}
                    >
                      {visual.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="m-0 truncate font-bold text-card-foreground">{aisle.name}</p>
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
