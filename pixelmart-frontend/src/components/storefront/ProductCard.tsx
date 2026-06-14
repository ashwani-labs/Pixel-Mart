import type { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  discountPercent,
  getCategoryVisual,
  getProductEmoji,
  savingsAmount,
} from '@/lib/categoryStyle';
import type { Product } from '@/types/catalog';
import type { RootState } from '@/store';
import { useAddCartItemMutation } from '@/store/api/orderApi';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

interface ProductCardProps {
  product: Product;
  formatPrice: (value: number) => string;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  showAddToCart?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  formatPrice,
  showWishlist = false,
  isWishlisted = false,
  onWishlistToggle,
  showAddToCart = true,
  className,
}: ProductCardProps) {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const [addToCart, { isLoading: adding }] = useAddCartItemMutation();
  const visual = getCategoryVisual(product.categoryId);
  const emoji = getProductEmoji(product.slug, product.categoryId);
  const savings = discountPercent(product.effectivePrice, product.compareAtPrice);
  const savedAmt = savingsAmount(product.effectivePrice, product.compareAtPrice);
  const outOfStock = product.stockQty <= 0;

  const handleAdd = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap();
    } catch {
      // toast could go here
    }
  };

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md',
        className,
      )}
    >
      <Link to={`/products/${product.slug}`} className="relative block no-underline hover:no-underline">
        <div
          className={cn(
            'relative flex aspect-[5/4] flex-col items-center justify-center bg-gradient-to-br p-3',
            visual.gradient,
          )}
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/60" />
            <div className="absolute -bottom-6 -left-4 h-24 w-24 rounded-full bg-white/40" />
          </div>

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {savings != null && savings > 0 && (
              <Badge variant="deal">{savings}% OFF</Badge>
            )}
            {product.featured && <Badge variant="default">Popular</Badge>}
          </div>

          {product.offerName && (
            <Badge variant="success" className="absolute right-2 top-2 max-w-[48%] truncate text-[10px]">
              {product.offerName}
            </Badge>
          )}

          <span
            className="relative z-10 text-5xl drop-shadow-sm transition duration-200 group-hover:scale-110"
            aria-hidden
          >
            {emoji}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-1">
          <Link
            to={`/products/${product.slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground no-underline hover:text-primary hover:no-underline"
          >
            {product.name}
          </Link>
          {showWishlist && onWishlistToggle && (
            <button
              type="button"
              className="shrink-0 border-0 bg-transparent p-0 text-base text-red-500"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={onWishlistToggle}
            >
              {isWishlisted ? '♥' : '♡'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-lg font-extrabold text-foreground">
            {formatPrice(product.effectivePrice)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {savedAmt != null && savedAmt > 0 && (
          <p className="m-0 text-[11px] font-semibold text-deal-foreground">
            You save {formatPrice(savedAmt)}
          </p>
        )}

        {product.stockQty > 0 && product.stockQty <= 10 && (
          <p className="m-0 text-[11px] font-medium text-primary">Only {product.stockQty} left</p>
        )}

        {showAddToCart && (
          <Button
            type="button"
            variant="accent"
            size="sm"
            className="mt-auto w-full font-bold tracking-wide"
            disabled={outOfStock || adding}
            onClick={handleAdd}
          >
            {outOfStock ? 'Out of stock' : adding ? 'Adding…' : 'ADD'}
          </Button>
        )}
      </div>
    </article>
  );
}
