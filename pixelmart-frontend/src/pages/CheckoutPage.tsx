import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useCatalogLabel } from '@/i18n/catalogI18n';
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate';
import { clearGuestCart, getGuestCart, guestCartSummary } from '@/lib/guestCart';
import { trackEvent } from '@/lib/analytics';
import type { RootState } from '../store';
import {
  useCheckoutMutation,
  useGetAddressesQuery,
  useGetCartQuery,
  useGetPaymentConfigQuery,
  useGuestCheckoutMutation,
  useLazyLookupPincodeQuery,
  useVerifyRazorpayPaymentMutation,
} from '../store/api/orderApi';
import { openRazorpayCheckout } from '@/lib/razorpay';
import type { Order } from '../types/order';
import { setCredentials } from '../store/slices/authSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import type { PaymentMethod } from '../types/order';
import {
  COD_MAX_ORDER_TOTAL,
  computeShippingFee,
  freeDeliveryMessage,
  isCodAvailable,
} from '@/lib/shipping';
import styles from './CheckoutPage.module.css';

function formatPrice(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function CheckoutPage() {
  const { t } = useTranslation();
  const catalogName = useCatalogLabel();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => selectIsAuthenticated(s));
  const marketLocale = useSelector((s: RootState) => s.settings.marketLocale);
  const marketCurrencyCode = useSelector((s: RootState) => s.settings.marketCurrencyCode);
  const taxEnabled = useSelector((s: RootState) => s.settings.taxEnabled);
  const taxRatePercent = useSelector((s: RootState) => s.settings.taxRatePercent);
  const taxLabel = useSelector((s: RootState) => s.settings.taxLabel);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOCK_UPI');
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
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();
  const { data: paymentConfig } = useGetPaymentConfigQuery();
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    ...(paymentConfig?.razorpayEnabled
      ? [{ id: 'RAZORPAY' as PaymentMethod, title: t('checkout.razorpay'), description: t('checkout.razorpayDesc') }]
      : []),
    { id: 'MOCK_UPI' as PaymentMethod, title: t('checkout.upi'), description: t('checkout.upiDesc') },
    { id: 'MOCK_CARD' as PaymentMethod, title: t('checkout.card'), description: t('checkout.cardDesc') },
    { id: 'MOCK_WALLET' as PaymentMethod, title: t('checkout.wallet'), description: t('checkout.walletDesc') },
    { id: 'MOCK_COD' as PaymentMethod, title: t('checkout.cod'), description: t('checkout.codDesc') },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestItems(getGuestCart());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    trackEvent('CHECKOUT_START');
  }, []);

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
  const shippingTotal = computeShippingFee(discountedSubtotal);
  const grandTotal = discountedSubtotal + taxTotal + shippingTotal;
  const codAvailable = isCodAvailable(grandTotal);

  useEffect(() => {
    if (!codAvailable && paymentMethod === 'MOCK_COD') {
      setPaymentMethod('MOCK_UPI');
    }
  }, [codAvailable, paymentMethod]);

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
      setError(t('checkout.pinError'));
    }
  };

  useEffect(() => {
    if (paymentConfig?.razorpayEnabled) {
      setPaymentMethod('RAZORPAY');
    }
  }, [paymentConfig?.razorpayEnabled]);

  const completeRazorpayPayment = async (order: Order, customer?: { name?: string; email?: string; phone?: string }) => {
    if (!order.razorpayKeyId || !order.razorpayOrderId || !order.razorpayAmountPaise) {
      throw new Error('Razorpay checkout details are missing');
    }
    await openRazorpayCheckout({
      keyId: order.razorpayKeyId,
      amountPaise: order.razorpayAmountPaise,
      currency: 'INR',
      orderId: order.orderNumber,
      razorpayOrderId: order.razorpayOrderId,
      customerName: customer?.name,
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      onSuccess: async (response) => {
        await verifyRazorpayPayment({
          orderId: order.id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        }).unwrap();
        navigate(`/orders/${order.id}`, { state: { checkedOut: true } });
      },
      onDismiss: () => setError(t('checkout.payCancelled')),
    });
  };

  const placeOrder = async () => {
    setError(null);
    if (!isAuthenticated) {
      if (!guestEmail || !guestFullName || !guestPhone || !guestAddressLine1 || !guestCity || !guestState || !guestPincode) {
        setError(t('checkout.fillDetails'));
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
              loyaltyPoints: 0,
              referralCode: null,
            },
          }),
        );
        if (paymentMethod === 'RAZORPAY') {
          await completeRazorpayPayment(response.order, {
            name: guestFullName.trim(),
            email: guestEmail.trim(),
            phone: guestPhone.trim(),
          });
          return;
        }
        navigate(`/orders/${response.order.id}`, { state: { checkedOut: true } });
      } catch {
        setError(t('checkout.placeFailedGuest'));
      }
      return;
    }

    if (!selectedAddressId) {
      setError(t('checkout.chooseAddress'));
      return;
    }
    try {
      const trimmedCoupon = couponCode.trim();
      const order = await checkout({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: trimmedCoupon || undefined,
      }).unwrap();
      if (paymentMethod === 'RAZORPAY') {
        const selectedAddress = addresses?.find((address) => address.id === selectedAddressId);
        await completeRazorpayPayment(order, {
          name: selectedAddress?.fullName,
          email: undefined,
          phone: selectedAddress?.phone,
        });
        return;
      }
      navigate(`/orders/${order.id}`, { state: { checkedOut: true } });
    } catch {
      setError(t('checkout.placeFailed'));
    }
  };

  if ((isAuthenticated && loadingCart) || (isAuthenticated && loadingAddresses)) {
    return <p className={styles.muted}>{t('checkout.loading')}</p>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <h1>{t('checkout.title')}</h1>
        <p className={styles.muted}>{t('checkout.empty')}</p>
        <Link to="/products" className={styles.primaryLink}>
          {t('cart.browseProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>{t('checkout.title')}</h1>
      {!isAuthenticated && (
        <p className={styles.muted}>
          {t('checkout.guestHint')}
        </p>
      )}
      <div className={styles.stepper}>
        <span>{t('checkout.stepAddress')}</span>
        <span>{t('checkout.stepPayment')}</span>
        <span>{t('checkout.stepReview')}</span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{t('checkout.deliveryAddress')}</h2>
          {isAuthenticated && <Link to="/profile/addresses">{t('checkout.manageAddresses')}</Link>}
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
                  <strong>{address.label ?? t('checkout.address')}</strong>
                  {address.isDefault && <span className={styles.badge}>{t('checkout.default')}</span>}
                  <span>{address.fullName} · {address.phone}</span>
                  <span>{address.addressLine1}</span>
                  <span>
                    {address.city}, {address.state} {address.pincode}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.muted}>{t('checkout.needAddress')}</p>
          )
        ) : (
          <div className={styles.addressGrid}>
            <label className={styles.couponField}>
              {t('checkout.email')}
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              {t('checkout.fullName')}
              <input value={guestFullName} onChange={(e) => setGuestFullName(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              {t('checkout.phone')}
              <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              {t('checkout.address1')}
              <input value={guestAddressLine1} onChange={(e) => setGuestAddressLine1(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              {t('checkout.address2')}
              <input value={guestAddressLine2} onChange={(e) => setGuestAddressLine2(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              {t('checkout.pincode')}
              <input
                value={guestPincode}
                maxLength={6}
                onChange={(e) => setGuestPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onBlur={() => void lookupGuestPin()}
              />
            </label>
            <label className={styles.couponField}>
              {t('checkout.city')}
              <input value={guestCity} onChange={(e) => setGuestCity(e.target.value)} />
            </label>
            <label className={styles.couponField}>
              {t('checkout.state')}
              <input value={guestState} onChange={(e) => setGuestState(e.target.value)} />
            </label>
            <DeliveryEstimate compact />
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="checkout-payment-heading">
        <h2 id="checkout-payment-heading">{t('checkout.paymentMethod')}</h2>
        <div className={styles.paymentGrid} role="radiogroup" aria-label={t('checkout.paymentMethod')}>
          {paymentMethods.map((method) => {
            const disabled = method.id === 'MOCK_COD' && !codAvailable;
            return (
            <label
              key={method.id}
              className={`${paymentMethod === method.id ? styles.selectedCard : styles.card}${disabled ? ` ${styles.disabledCard}` : ''}`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === method.id}
                disabled={disabled}
                onChange={() => setPaymentMethod(method.id)}
              />
              <strong>{method.title}</strong>
              <span>
                {disabled
                  ? t('checkout.codUnavailable', { max: COD_MAX_ORDER_TOTAL })
                  : method.description}
              </span>
            </label>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('checkout.reviewOrder')}</h2>
        {isAuthenticated && (
          <label className={styles.couponField}>
            {t('checkout.coupon')}
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
                {catalogName(item.productName)} × {item.quantity}
              </span>
              <strong>{formatPrice(item.lineTotal, marketLocale, marketCurrencyCode)}</strong>
            </li>
          ))}
        </ul>
        <div className={styles.totals}>
          <p>
            <span>{t('checkout.subtotal')}</span>
            <strong>{formatPrice(subtotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
          {discountTotal > 0 && (
            <p>
              <span>{catalogName(cart?.discountLabel) || t('checkout.cartDiscount')}</span>
              <strong>-{formatPrice(discountTotal, marketLocale, marketCurrencyCode)}</strong>
            </p>
          )}
          <p>
            <span>
              {taxLabel} {taxEnabled ? `(${taxRatePercent}%)` : ''}
            </span>
            <strong>{formatPrice(taxTotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
          <p>
            <span>{t('checkout.delivery')}</span>
            <strong>
              {shippingTotal === 0
                ? t('checkout.free')
                : formatPrice(shippingTotal, marketLocale, marketCurrencyCode)}
            </strong>
          </p>
          <p className={styles.muted}>{freeDeliveryMessage(discountedSubtotal)}</p>
          <p className={styles.grandTotal}>
            <span>{t('checkout.total')}</span>
            <strong>{formatPrice(grandTotal, marketLocale, marketCurrencyCode)}</strong>
          </p>
        </div>
      </section>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Link to="/cart">{t('checkout.backToCart')}</Link>
        <button
          type="button"
          className={styles.placeOrderBtn}
          disabled={placingOrder || placingGuestOrder || (isAuthenticated && !selectedAddressId)}
          onClick={() => void placeOrder()}
        >
          {placingOrder || placingGuestOrder
            ? t('checkout.placing')
            : paymentMethod === 'RAZORPAY'
              ? t('checkout.payRazorpay')
              : t('checkout.placeMock')}
        </button>
      </div>
    </div>
  );
}
