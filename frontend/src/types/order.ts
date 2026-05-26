export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
}

export interface AddCartItemRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export type PaymentMethod = 'MOCK_CARD' | 'MOCK_UPI' | 'MOCK_WALLET' | 'MOCK_COD';

export interface CheckoutRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Payment {
  method: PaymentMethod;
  status: string;
  amount: number;
  providerReference: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  taxLabel: string;
  taxRatePercent: number;
  shipToName: string;
  shipToPhone: string;
  shipAddressLine1: string;
  shipAddressLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  shipCountry: string;
  shipPostOfficeName: string | null;
  items: OrderItem[];
  payment: Payment;
}
