const STORAGE_KEY = 'pixelmart_delivery_pin';

export interface SavedDeliveryPin {
  pincode: string;
  city: string;
  state: string;
}

export function readDeliveryPin(): SavedDeliveryPin | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedDeliveryPin;
    if (!/^[0-9]{6}$/.test(parsed.pincode)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDeliveryPin(pin: SavedDeliveryPin): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pin));
}
