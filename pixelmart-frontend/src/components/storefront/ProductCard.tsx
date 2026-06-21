import { useEffect, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  addGuestCartItem,
  getGuestCart,
  removeGuestCartItem,
  updateGuestCartQuantity,
} from '@/lib/guestCart';
import {
  discountPercent,
  getCategoryVisual,
  getProductEmoji,
  savingsAmount,
} from '@/lib/categoryStyle';
import type { Product } from '@/types/catalog';
import type { RootState } from '@/store';
import {
  useAddCartItemMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '@/store/api/orderApi';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

function StepperIcon({ type }: { type: 'minus' | 'plus' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="block h-3.5 w-3.5 shrink-0"
      aria-hidden
      fill="none"
    >
      <path
        d={type === 'minus' ? 'M3.5 8h9' : 'M8 3.5v9M3.5 8h9'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [addToCart, { isLoading: adding }] = useAddCartItemMutation();
  const [updateCartItem, { isLoading: updating }] = useUpdateCartItemMutation();
  const [removeCartItem, { isLoading: removing }] = useRemoveCartItemMutation();
  const [guestQty, setGuestQty] = useState(
    () => getGuestCart().find((item) => item.productId === product.id)?.quantity ?? 0,
  );

  const visual = getCategoryVisual(product.categoryId);
  const emoji = getProductEmoji(product.slug, product.categoryId);
  const savings = discountPercent(product.effectivePrice, product.compareAtPrice);
  const savedAmt = savingsAmount(product.effectivePrice, product.compareAtPrice);
  const outOfStock = product.stockQty <= 0;
  const cartLine = cart?.items.find((item) => item.productId === product.id);
  const quantity = isAuthenticated ? (cartLine?.quantity ?? 0) : guestQty;
  const cartItemId = cartLine?.id;
  const busy = adding || updating || removing;

  useEffect(() => {
    if (isAuthenticated) return;
    const syncGuestQty = () => {
      setGuestQty(getGuestCart().find((item) => item.productId === product.id)?.quantity ?? 0);
    };
    syncGuestQty();
    window.addEventListener('pixelmart-guest-cart-updated', syncGuestQty);
    return () => window.removeEventListener('pixelmart-guest-cart-updated', syncGuestQty);
  }, [isAuthenticated, product.id]);

  const stopCardNav = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAdd = async (e: MouseEvent) => {
    stopCardNav(e);
    if (outOfStock) return;

    if (!isAuthenticated) {
      addGuestCartItem({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        unitPrice: product.effectivePrice,
      });
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap();
    } catch {
      // toast could go here
    }
  };

  const handleIncrement = async (e: MouseEvent) => {
    stopCardNav(e);
    if (quantity >= product.stockQty) return;

    if (!isAuthenticated) {
      updateGuestCartQuantity(product.id, quantity + 1);
      return;
    }

    if (!cartItemId) return;
    try {
      await updateCartItem({ id: cartItemId, body: { quantity: quantity + 1 } }).unwrap();
    } catch {
      // toast could go here
    }
  };

  const handleDecrement = async (e: MouseEvent) => {
    stopCardNav(e);
    if (quantity <= 0) return;

    if (!isAuthenticated) {
      if (quantity <= 1) {
        removeGuestCartItem(product.id);
      } else {
        updateGuestCartQuantity(product.id, quantity - 1);
      }
      return;
    }

    if (!cartItemId) return;
    try {
      if (quantity <= 1) {
        await removeCartItem(cartItemId).unwrap();
      } else {
        await updateCartItem({ id: cartItemId, body: { quantity: quantity - 1 } }).unwrap();
      }
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
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/50 dark:bg-white/10" />
            <div className="absolute -bottom-6 -left-4 h-24 w-24 rounded-full bg-white/30 dark:bg-white/5" />
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
              className="shrink-0 border-0 bg-transparent p-0 text-base text-destructive hover:opacity-80"
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
          <div className="mt-auto pt-0.5">
            {quantity > 0 ? (
              <div
                className="qty-stepper flex h-9 w-full items-center justify-between gap-1 rounded-full border-2 border-accent bg-card px-1 shadow-sm ring-1 ring-accent/20"
                role="group"
                aria-label={`Quantity for ${product.name}`}
              >
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-0 bg-accent p-0 text-accent-foreground shadow-sm transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                  disabled={busy}
                  aria-label="Decrease quantity"
                  onClick={(e) => void handleDecrement(e)}
                >
                  <StepperIcon type="minus" />
                </button>
                <span
                  className={cn(
                    'min-w-[1.75rem] flex-1 text-center text-sm font-extrabold tabular-nums text-foreground',
                    busy && 'animate-pulse opacity-70',
                  )}
                >
                  {busy ? '…' : quantity}
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-0 bg-accent p-0 text-accent-foreground shadow-sm transition hover:brightness-105 active:scale-95 disabled:opacity-40"
                  disabled={busy || quantity >= product.stockQty}
                  aria-label="Increase quantity"
                  title={quantity >= product.stockQty ? 'Maximum stock reached' : undefined}
                  onClick={(e) => void handleIncrement(e)}
                >
                  <StepperIcon type="plus" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="accent"
                size="sm"
                className="h-9 w-full rounded-full font-bold tracking-wide shadow-sm transition active:scale-[0.98]"
                disabled={outOfStock || adding}
                onClick={(e) => void handleAdd(e)}
              >
                {outOfStock ? 'Out of stock' : adding ? 'Adding…' : 'ADD'}
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
