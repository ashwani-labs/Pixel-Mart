import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '@/components/storefront/ProductCard';
import { getRecentlyViewedIds } from '@/lib/recentlyViewed';
import { useGetProductsByIdsQuery } from '@/store/api/catalogApi';

interface RecentlyViewedProps {
  formatPrice: (value: number) => string;
  excludeProductId?: string;
}

export function RecentlyViewed({ formatPrice, excludeProductId }: RecentlyViewedProps) {
  const { t } = useTranslation();
  const ids = useMemo(() => {
    const all = getRecentlyViewedIds();
    return excludeProductId ? all.filter((id) => id !== excludeProductId) : all;
  }, [excludeProductId]);

  const { data: products = [], isLoading } = useGetProductsByIdsQuery(ids, {
    skip: ids.length === 0,
  });

  if (ids.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section>
        <h2 className="m-0 mb-4 text-xl font-bold text-foreground">{t('product.recentlyViewed')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: Math.min(ids.length, 4) }).map((_, i) => (
            <div key={i} className="h-64 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-card to-muted" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="m-0 mb-4 text-xl font-bold text-foreground">{t('product.recentlyViewed')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} formatPrice={formatPrice} showAddToCart />
        ))}
      </div>
    </section>
  );
}
