import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCategoryVisual, getProductEmoji } from '@/lib/categoryStyle';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { ProductReviews } from '../components/product/ProductReviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useAddWishlistItemMutation,
  useGetProductBySlugQuery,
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
} from '../store/api/catalogApi';
import { useAddCartItemMutation } from '../store/api/orderApi';
import type { RootState } from '../store';
import { selectIsAuthenticated } from '../store/slices/authSlice';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function ProductDetailPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug ?? '', {
    skip: !slug,
  });
  const [addToCart, { isLoading: adding }] = useAddCartItemMutation();
  const { data: wishlist = [] } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addWishlistItem] = useAddWishlistItemMutation();
  const [removeWishlistItem] = useRemoveWishlistItemMutation();
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="h-80 animate-shimmer rounded-xl bg-gradient-to-r from-muted via-card to-muted" />
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/products">← Back to products</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }
    if (isWishlisted) {
      await removeWishlistItem(product.id);
      return;
    }
    await addWishlistItem(product.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="no-underline hover:text-primary hover:no-underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="no-underline hover:text-primary hover:no-underline">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        {product.images.length > 0 ? (
          <ProductImageGallery images={product.images} productName={product.name} />
        ) : (
          <div
            className={`flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-gradient-to-br text-7xl ${getCategoryVisual(product.categoryId).gradient}`}
            aria-hidden
          >
            {getProductEmoji(product.slug, product.categoryId)}
          </div>
        )}
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {product.featured && <Badge>Featured</Badge>}
            {product.offerName && <Badge variant="success">{product.offerName}</Badge>}
          </div>
          <h1 className="m-0 mb-2 text-3xl font-bold text-foreground">{product.name}</h1>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{formatPrice(product.effectivePrice)}</span>
            {product.compareAtPrice && (
              <span className="text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="text-muted-foreground">{product.description ?? 'No description available.'}</p>
          <p className="text-sm text-muted-foreground">In stock: {product.stockQty}</p>
          <Button
            variant="accent"
            size="lg"
            className="mt-5 min-w-[10rem]"
            disabled={adding || product.stockQty < 1}
            onClick={async () => {
              setCartMessage(null);
              if (!isAuthenticated) {
                navigate('/login', { state: { from: `/products/${slug}` } });
                return;
              }
              try {
                await addToCart({ productId: product.id, quantity: 1 }).unwrap();
                setCartMessage('Added to cart.');
              } catch {
                setCartMessage('Could not add to cart.');
              }
            }}
          >
            {adding ? 'Adding…' : 'ADD TO CART'}
          </Button>
          <Button type="button" variant="outline" className="mt-3" onClick={handleWishlistToggle}>
            {isWishlisted ? '♥ Remove from wishlist' : '♡ Add to wishlist'}
          </Button>
          {cartMessage && <p className="mt-2 text-sm text-primary">{cartMessage}</p>}
          {isAuthenticated && (
            <Link to="/cart" className="mt-2 inline-block text-sm">
              View cart
            </Link>
          )}
        </div>
      </div>
      <ProductReviews productId={product.id} />
    </div>
  );
}
