declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpaySuccessResponse) => void) => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const SCRIPT_ID = 'razorpay-checkout-js';
const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve();
  }
  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')), {
        once: true,
      });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  amountPaise: number;
  currency: string;
  orderId: string;
  razorpayOrderId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
}): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error('Razorpay is unavailable');
  }
  const razorpay = new window.Razorpay({
    key: options.keyId,
    amount: options.amountPaise,
    currency: options.currency,
    name: 'PixelMart',
    description: `Order ${options.orderId}`,
    order_id: options.razorpayOrderId,
    prefill: {
      name: options.customerName,
      email: options.customerEmail,
      contact: options.customerPhone,
    },
    theme: { color: '#6366f1' },
    handler: options.onSuccess,
    modal: { ondismiss: options.onDismiss },
  });
  razorpay.open();
}
