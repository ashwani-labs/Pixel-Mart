import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate';
import { clearGuestCart, getGuestCart, guestCartSummary } from '@/lib/guestCart';
import type { RootState } from '../store';
import {
  useCheckoutMutation,
  useGetAddressesQuery,
  useGetCartQuery,
  useGuestCheckoutMutation,
  useLazyLookupPincodeQuery,
} from '../store/api/orderApi';
import { setCredentials } from '../store/slices/authSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const taxEnabled = useSelector((s: RootState) => s.settings.taxEnabled);
  const taxRatePercent = useSelector((s: RootState) => s.settings.taxRatePercent);
  const taxLabel = useSelector((s: RootState) => s.settings.taxLabel);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOCK_CARD');
  const [couponCode, setCouponCode] = useState('');
  const [guestItems, setGuestItems] = useState(getGuestCart());
  const [guestEmail, setGuestEmail] = useState('');
  const [guestFullName, setGuestFullName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddressLine1, setGuestAddressLine1] = useState('');
  const [guestAddressLine2, setGuestAddressLine2] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestState, setGuestState] = useState('');
  const [guestPincode, setGuestPincode] = useState('');
  const [lookupPincode] = useLazyLookupPincodeQuery();
  const { data: cart, isLoading: loadingCart } = useGetCartQuery(couponCode.trim() || undefined, {
    skip: !isAuthenticated,
  });
  const { data: addresses, isLoading: loadingAddresses } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [checkout, { isLoading: placingOrder }] = useCheckoutMutation();
  const [guestCheckout, { isLoading: placingGuestOrder }] = useGuestCheckoutMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestItems(getGuestCart());
    }
  }, [isAuthenticated]);

  const items = isAuthenticated
    ? (cart?.items ?? [])
    : guestItems.map((item) => ({
        id: item.productId,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.unitPrice * item.quantity,
      }));

  const defaultAddress = addresses?.find((address) => address.isDefault) ?? addresses?.[0];
  const selectedAddressId = addressId || defaultAddress?.id || '';
  const subtotal = isAuthenticated ? (cart?.subtotal ?? 0) : guestCartSummary(guestItems).subtotal;
  const discountTotal = isAuthenticated ? (cart?.discountTotal ?? 0) : 0;
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

  const lookupGuestPin = async () => {
    if (!/^[0-9]{6}$/.test(guestPincode)) return;
    try {
      const result = await lookupPincode(guestPincode).unwrap();
      setGuestCity(result.city);
      setGuestState(result.state);
    } catch {
      setError('Could not verify PIN code.');
    }
  };

  const placeOrder = async () => {
    setError(null);
    if (!isAuthenticated) {
      if (!guestEmail || !guestFullName || !guestPhone || !guestAddressLine1 || !guestCity || !guestState || !guestPincode) {
        setError('Fill in contact and delivery details to continue.');
        return;
      }
      try {
        const response = await guestCheckout({
          email: guestEmail.trim(),
          fullName: guestFullName.trim(),
          phone: guestPhone.trim(),
          addressLine1: guestAddressLine1.trim(),
          addressLine2: guestAddressLine2.trim() || undefined,
          city: guestCity.trim(),
          state: guestState.trim(),
          pincode: guestPincode.trim(),
          paymentMethod,
          couponCode: couponCode.trim() || undefined,
          items: guestItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }).unwrap();
        clearGuestCart();
        dispatch(
          setCredentials({
            accessToken: response.accessToken,
            user: {
              id: response.userId,
              email: response.email,
              name: response.userName,
              roles: ['CUSTOMER'],
            },
          }),
        );
        navigate(`/orders/${response.order.id}`, { state: { checkedOut: true } });
      } catch {
        setError('Could not place order. Check stock and delivery details.');
      }
      return;
    }

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

  if ((isAuthenticated && loadingCart) || (isAuthenticated && loadingAddresses)) {
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
      {!isAuthenticated && (
        <p className={styles.muted}>
          Guest checkout — no password needed. We will email order updates to you.
        </p>
      )}
      <div className={styles.stepper}>
        <span>1. Address</span>
        <span>2. Payment</span>
        <span>3. Review</span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Delivery address</h2>
          {isAuthenticated && <Link to="/profile/addresses">Manage addresses</Link>}
        </div>
        {isAuthenticated ? (
          addresses && addresses.length > 0 ? (
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
            <p className={styles.muted}>Add a delivery address from your profile before checkout.</p>
          )
        ) : (
          <div className={styles.addressGrid}>
            <label className={styles.couponField}>
              Email
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              Full name
              <input value={guestFullName} onChange={(e) => setGuestFullName(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              Phone
              <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              Address line 1
              <input value={guestAddressLine1} onChange={(e) => setGuestAddressLine1(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              Address line 2
              <input value={guestAddressLine2} onChange={(e) => setGuestAddressLine2(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              PIN code
              <input
                value={guestPincode}
                maxLength={6}
                onChange={(e) => setGuestPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onBlur={() => void lookupGuestPin()}
              />
            </label>
            <label className={styles.couponField}>
              City
              <input value={guestCity} onChange={(e) => setGuestCity(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              State
              <input value={guestState} onChange={(e) => setGuestState(e.target.value)} />
            </label>
            <DeliveryEstimate compact />
          </div>
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
        {isAuthenticated && (
          <label className={styles.couponField}>
            Coupon code
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="STYLE15"
            />
          </label>
        )}
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
          disabled={placingOrder || placingGuestOrder || (isAuthenticated && !selectedAddressId)}
          onClick={() => void placeOrder()}
        >
          {placingOrder || placingGuestOrder ? 'Placing order…' : 'Place mock order'}
        </button>
      </div>
    </div>
  );
}
