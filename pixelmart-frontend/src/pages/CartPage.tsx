import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate';
import type { RootState } from '../store';
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '../store/api/orderApi';
import { selectIsAuthenticated } from '../store/slices/authSlice';

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function CartPage() {
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const { data: cart, isLoading, isError } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading your cart…</p>;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <p className="text-muted-foreground">Could not load your cart. Try again later.</p>
        <Button variant="default" className="mt-4" asChild>
          <Link to="/products" className="no-underline hover:no-underline">
            Continue shopping
          </Link>
        </Button>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="m-0 mb-6 text-2xl font-extrabold">My cart</h1>

      {items.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <p className="m-0 text-lg font-semibold">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Add items from our aisles to get started.</p>
            <Button variant="accent" className="mt-6" asChild>
              <Link to="/products" className="no-underline hover:no-underline">
                Start shopping
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {items.map((item) => (
              <li key={item.id}>
                <Card>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xl font-bold text-primary">
                        {item.productName.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <Link
                          to={`/products/${item.productSlug}`}
                          className="block truncate font-semibold no-underline hover:text-primary hover:no-underline"
                        >
                          {item.productName}
                        </Link>
                        <p className="m-0 mt-0.5 text-sm text-muted-foreground">
                          {formatPrice(item.unitPrice, marketLocale, marketCurrencyCode)} each
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        Qty
                        <input
                          type="number"
                          min={1}
                          className="h-9 w-16 rounded-md border border-border bg-input px-2 text-center text-foreground"
                          value={item.quantity}
                          onChange={async (e) => {
                            const qty = parseInt(e.target.value, 10);
                            if (qty >= 1) {
                              await updateItem({ id: item.id, body: { quantity: qty } });
                            }
                          }}
                        />
                      </label>
                      <span className="min-w-[5rem] text-right font-bold">
                        {formatPrice(item.lineTotal, marketLocale, marketCurrencyCode)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <Card className="h-fit border-primary/20 bg-card shadow-md lg:sticky lg:top-24">
            <CardContent className="flex flex-col gap-4 p-5">
              <h2 className="m-0 text-lg font-bold">Order summary</h2>
              <DeliveryEstimate compact />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({cart!.totalQuantity})</span>
                <span className="font-semibold">
                  {formatPrice(cart!.subtotal, marketLocale, marketCurrencyCode)}
                </span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-base font-extrabold">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart!.subtotal, marketLocale, marketCurrencyCode)}</span>
                </div>
              </div>
              <Button variant="accent" size="lg" className="w-full" asChild>
                <Link to="/checkout" className="no-underline hover:no-underline">
                  Proceed to checkout
                </Link>
              </Button>
              <Link to="/products" className="text-center text-sm font-medium">
                Continue shopping
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
