export const FREE_DELIVERY_THRESHOLD = 499;
export const STANDARD_SHIPPING_FEE = 49;
export const COD_MAX_ORDER_TOTAL = 2000;

export function computeShippingFee(subtotalAfterDiscount: number): number {
  return subtotalAfterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function freeDeliveryMessage(subtotalAfterDiscount: number): string {
  if (subtotalAfterDiscount >= FREE_DELIVERY_THRESHOLD) {
    return 'You qualify for free delivery';
  }
  const remaining = FREE_DELIVERY_THRESHOLD - subtotalAfterDiscount;
  return `Add ₹${Math.ceil(remaining)} more for free delivery`;
}

export function isCodAvailable(grandTotal: number): boolean {
  return grandTotal <= COD_MAX_ORDER_TOTAL;
}
