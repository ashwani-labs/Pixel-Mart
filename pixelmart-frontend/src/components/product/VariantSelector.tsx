import { useTranslation } from 'react-i18next';
import type { ProductVariant } from '@/types/catalog';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  const { t } = useTranslation();

  if (!variants.length) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-foreground">{t('product.selectVariant')}</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const selected = variant.id === selectedVariantId;
          const outOfStock = variant.stockQty < 1;
          return (
            <button
              key={variant.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onSelect(variant.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/50'
              } ${outOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {variant.label}
              {outOfStock && ` (${t('cart.outOfStock')})`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
