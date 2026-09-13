import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StickyAddToCartBarProps {
  productName: string;
  priceLabel: string;
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  onAddToCart: () => void;
}

export function StickyAddToCartBar({
  productName,
  priceLabel,
  visible,
  disabled,
  loading,
  onAddToCart,
}: StickyAddToCartBarProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-lg backdrop-blur md:hidden',
        'transition-transform duration-200',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      role="region"
      aria-label={t('cart.addToCart')}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-semibold text-foreground">{productName}</p>
          <p className="m-0 text-sm font-bold text-primary">{priceLabel}</p>
        </div>
        <Button
          type="button"
          variant="accent"
          size="lg"
          className="shrink-0 font-bold"
          disabled={disabled || loading}
          onClick={onAddToCart}
        >
          {loading ? t('card.adding') : disabled ? t('cart.outOfStock') : t('cart.addToCartCaps')}
        </Button>
      </div>
    </div>
  );
}
