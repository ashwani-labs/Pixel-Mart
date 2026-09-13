import { useTranslation } from 'react-i18next';
import { ProductCard } from '@/components/storefront/ProductCard';
import { useGetProductsByIdsQuery } from '@/store/api/catalogApi';
import { useGetFrequentlyBoughtTogetherQuery } from '@/store/api/orderApi';

interface FrequentlyBoughtTogetherProps {
  productId: string;
  formatPrice: (value: number) => string;
}

export function FrequentlyBoughtTogether({ productId, formatPrice }: FrequentlyBoughtTogetherProps) {
  const { t } = useTranslation();
  const { data: insights, isLoading: loadingIds } = useGetFrequentlyBoughtTogetherQuery(productId);
  const productIds = insights?.productIds ?? [];
  const { data: products = [], isLoading: loadingProducts } = useGetProductsByIdsQuery(productIds, {
    skip: productIds.length === 0,
  });

  if (loadingIds || loadingProducts) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-card to-muted" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="m-0 mb-4 text-xl font-bold text-foreground">{t('product.fbt')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} formatPrice={formatPrice} showAddToCart />
        ))}
      </div>
    </section>
  );
}
