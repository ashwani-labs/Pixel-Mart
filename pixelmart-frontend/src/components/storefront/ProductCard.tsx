import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface ProductCardProps {
  product: Product;
  formatPrice: (value: number) => string;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  className?: string;
}

export function ProductCard({
  product,
  formatPrice,
  showWishlist = false,
  isWishlisted = false,
  onWishlistToggle,
  className,
}: ProductCardProps) {
  return (
    <Card className={cn('overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md', className)}>
      <Link
        to={`/products/${product.slug}`}
        className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/20 to-muted text-3xl text-muted-foreground no-underline hover:no-underline"
      >
        ◆
      </Link>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {product.featured && <Badge>Featured</Badge>}
            {product.offerName && <Badge variant="success">{product.offerName}</Badge>}
          </div>
          {showWishlist && onWishlistToggle && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 text-red-500"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={onWishlistToggle}
            >
              {isWishlisted ? '♥' : '♡'}
            </Button>
          )}
        </div>
        <Link to={`/products/${product.slug}`} className="no-underline hover:no-underline">
          <h3 className="m-0 text-base font-semibold text-foreground">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-primary">{formatPrice(product.effectivePrice)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
