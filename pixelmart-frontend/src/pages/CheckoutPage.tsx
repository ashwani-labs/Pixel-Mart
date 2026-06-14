import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  useCheckoutMutation,
  useGetAddressesQuery,
  useGetCartQuery,
} from '../store/api/orderApi';
import type { PaymentMethod } from '../types/order';
import styles from './CheckoutPage.module.css';

const PAYMENT_METHODS: Array<{ id: PaymentMethod; title: string; description: string }> = [
  { id: 'MOCK_CARD', title: 'Mock Card', description: 'Instant paid card authorization.' },
  { id: 'MOCK_UPI', title: 'Mock UPI', description: 'Instant paid UPI collection.' },
  { id: 'MOCK_WALLET', title: 'Mock Wallet', description: 'Instant paid wallet debit.' },
  { id: 'MOCK_COD', title: 'Cash on Delivery', description: 'Order stays pending payment.' },
];

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const taxEnabled = useSelector((s: RootState) => s.settings.taxEnabled);
  const taxRatePercent = useSelector((s: RootState) => s.settings.taxRatePercent);
  const taxLabel = useSelector((s: RootState) => s.settings.taxLabel);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOCK_CARD');
  const [couponCode, setCouponCode] = useState('');
  const { data: cart, isLoading: loadingCart } = useGetCartQuery(couponCode.trim() || undefined);
  const { data: addresses, isLoading: loadingAddresses } = useGetAddressesQuery();
  const [checkout, { isLoading: placingOrder }] = useCheckoutMutation();
  const [error, setError] = useState<string | null>(null);

  const items = cart?.items ?? [];
  const defaultAddress = addresses?.find((address) => address.isDefault) ?? addresses?.[0];
  const selectedAddressId = addressId || defaultAddress?.id || '';
  const subtotal = cart?.subtotal ?? 0;
  const discountTotal = cart?.discountTotal ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const taxTotal = taxEnabled
    ? Number(((discountedSubtotal * taxRatePercent) / 100).toFixed(2))
    : 0;
  const grandTotal = discountedSubtotal + taxTotal;

  useEffect(() => {
    if (!addressId && defaultAddress) {
      setAddressId(defaultAddress.id);
    }
  }, [addressId, defaultAddress]);

  const placeOrder = async () => {
    setError(null);
    if (!selectedAddressId) {
      setError('Choose a delivery address before placing the order.');
      return;
    }
    try {
      const trimmedCoupon = couponCode.trim();
      const order = await checkout({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: trimmedCoupon || undefined,
      }).unwrap();
      navigate(`/orders/${order.id}`, { state: { checkedOut: true } });
    } catch {
      setError('Could not place order. Check stock, coupon, and try again.');
    }
  };

  if (loadingCart || loadingAddresses) {
    return <p className={styles.muted}>Loading checkout…</p>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <h1>Checkout</h1>
        <p className={styles.muted}>Your cart is empty.</p>
        <Link to="/products" className={styles.primaryLink}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Checkout</h1>
      <div className={styles.stepper}>
        <span>1. Address</span>
        <span>2. Payment</span>
        <span>3. Review</span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Delivery address</h2>
          <Link to="/profile/addresses">Manage addresses</Link>
        </div>
        {addresses && addresses.length > 0 ? (
          <div className={styles.addressGrid}>
            {addresses.map((address) => (
              <label
                key={address.id}
                className={selectedAddressId === address.id ? styles.selectedCard : styles.card}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === address.id}
                  onChange={() => setAddressId(address.id)}
                />
                <strong>{address.label ?? 'Address'}</strong>
                {address.isDefault && <span className={styles.badge}>Default</span>}
                <span>{address.fullName} · {address.phone}</span>
                <span>{address.addressLine1}</span>
                <span>
                  {address.city}, {address.state} {address.pincode}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className={styles.muted}>
            Add a delivery address from your profile before checkout.
          </p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="checkout-payment-heading">
        <h2 id="checkout-payment-heading">Payment method</h2>
        <div className={styles.paymentGrid} role="radiogroup" aria-label="Payment method">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className={paymentMethod === method.id ? styles.selectedCard : styles.card}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === method.id}
                onChange={() => setPaymentMethod(method.id)}
              />
              <strong>{method.title}</strong>
              <span>{method.description}</span>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Review order</h2>
        <label className={styles.couponField}>
          Coupon code
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="STYLE15"
          />
        </label>
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={item.id}>
              <span>
                {item.productName} × {item.quantity}
              </span>
              <strong>{formatPrice(item.lineTotal, marketLocale, marketCurrencyCode)}</strong>
            </li>
          ))}
        </ul>
        <div className={styles.totals}>
          <p>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
          {discountTotal > 0 && (
            <p>
              <span>{cart?.discountLabel ?? 'Cart discount'}</span>
              <strong>-{formatPrice(discountTotal, marketLocale, marketCurrencyCode)}</strong>
            </p>
          )}
          <p>
            <span>
              {taxLabel} {taxEnabled ? `(${taxRatePercent}%)` : ''}
            </span>
            <strong>{formatPrice(taxTotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
          <p className={styles.grandTotal}>
            <span>Total</span>
            <strong>{formatPrice(grandTotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
        </div>
      </section>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Link to="/cart">← Back to cart</Link>
        <button
          type="button"
          className={styles.placeOrderBtn}
          disabled={placingOrder || !selectedAddressId}
          onClick={placeOrder}
        >
          {placingOrder ? 'Placing order…' : 'Place mock order'}
        </button>
      </div>
    </div>
  );
}
