import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
} from '../store/api/catalogApi';
import type { RootState } from '../store';
import { selectIsAuthenticated } from '../store/slices/authSlice';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function WishlistPage() {
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { data: wishlist = [], isLoading, isFetching } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [removeWishlistItem] = useRemoveWishlistItemMutation();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-foreground">My wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">{wishlist.length} saved items</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/products" className="no-underline hover:no-underline">
            Continue shopping
          </Link>
        </Button>
      </div>

      {isLoading || isFetching ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-shimmer rounded-xl bg-gradient-to-r from-muted via-card to-muted"
            />
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              formatPrice={formatPrice}
              showWishlist
              isWishlisted
              onWishlistToggle={() => removeWishlistItem(product.id)}
              showAddToCart
            />
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center">
          <CardContent>
            <p className="m-0 text-lg font-semibold text-card-foreground">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap ♡ on any product to save it for later.
            </p>
            <Button variant="accent" className="mt-6" asChild>
              <Link to="/products" className="no-underline hover:no-underline">
                Browse products
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
