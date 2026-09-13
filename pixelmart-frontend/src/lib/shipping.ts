import i18n from '@/i18n';

export const FREE_DELIVERY_THRESHOLD = 499;
export const STANDARD_SHIPPING_FEE = 49;
export const COD_MAX_ORDER_TOTAL = 2000;

export function computeShippingFee(subtotalAfterDiscount: number): number {
  return subtotalAfterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function freeDeliveryMessage(subtotalAfterDiscount: number): string {
  const remaining = Math.ceil(FREE_DELIVERY_THRESHOLD - subtotalAfterDiscount);
  if (subtotalAfterDiscount >= FREE_DELIVERY_THRESHOLD) {
    return i18n.t('shipping.qualified');
  }
  return i18n.t('shipping.addMore', { amount: remaining });
}

export function isCodAvailable(grandTotal: number): boolean {
  return grandTotal <= COD_MAX_ORDER_TOTAL;
}
