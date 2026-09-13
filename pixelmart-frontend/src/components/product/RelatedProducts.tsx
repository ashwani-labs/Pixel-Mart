import { useTranslation } from 'react-i18next';
import { ProductCard } from '@/components/storefront/ProductCard';
import { useGetProductsQuery } from '@/store/api/catalogApi';

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
  formatPrice: (value: number) => string;
}

export function RelatedProducts({ productId, categoryId, formatPrice }: RelatedProductsProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetProductsQuery({
    page: 0,
    size: 6,
    categoryId,
    inStockOnly: true,
  });

  const related = (data?.content ?? []).filter((p) => p.id !== productId).slice(0, 4);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-card to-muted" />
        ))}
      </div>
    );
  }

  if (related.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="m-0 mb-4 text-xl font-bold text-foreground">{t('product.related')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} formatPrice={formatPrice} showAddToCart />
        ))}
      </div>
    </section>
  );
}
