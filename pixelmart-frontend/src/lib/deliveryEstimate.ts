/** Metro PIN prefixes (first 2 digits) — faster delivery windows. */
const METRO_PIN_PREFIXES = new Set(['11', '12', '40', '41', '50', '56', '60', '70', '80']);

export interface DeliveryEstimateResult {
  pincode: string;
  city: string;
  state: string;
  deliveryBy: Date;
  deliveryLabel: string;
  isFastDelivery: boolean;
}

function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }
  return result;
}

function formatDeliveryDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function estimateDelivery(
  pincode: string,
  city: string,
  state: string,
  fromDate: Date = new Date(),
): DeliveryEstimateResult {
  const prefix = pincode.slice(0, 2);
  const isFastDelivery = METRO_PIN_PREFIXES.has(prefix);
  const businessDays = isFastDelivery ? 2 : 4;
  const deliveryBy = addBusinessDays(fromDate, businessDays);

  return {
    pincode,
    city,
    state,
    deliveryBy,
    deliveryLabel: formatDeliveryDate(deliveryBy),
    isFastDelivery,
  };
}
