import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { estimateDelivery } from '@/lib/deliveryEstimate';
import { readDeliveryPin, saveDeliveryPin } from '@/lib/deliveryPinStorage';
import { useLazyLookupPincodeQuery } from '@/store/api/orderApi';

interface DeliveryEstimateProps {
  compact?: boolean;
}

export function DeliveryEstimate({ compact = false }: DeliveryEstimateProps) {
  const [pinInput, setPinInput] = useState('');
  const [lookupPincode, { isFetching }] = useLazyLookupPincodeQuery();
  const [saved, setSaved] = useState(readDeliveryPin);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readDeliveryPin();
    if (stored) {
      setPinInput(stored.pincode);
      setSaved(stored);
    }
  }, []);

  const handleCheck = async () => {
    setError(null);
    if (!/^[0-9]{6}$/.test(pinInput)) {
      setError('Enter a valid 6-digit PIN code.');
      return;
    }
    try {
      const result = await lookupPincode(pinInput).unwrap();
      const pin = {
        pincode: result.pincode,
        city: result.city,
        state: result.state,
      };
      saveDeliveryPin(pin);
      setSaved(pin);
    } catch {
      setError('Could not verify this PIN. Try again.');
      setSaved(null);
    }
  };

  const estimate = saved ? estimateDelivery(saved.pincode, saved.city, saved.state) : null;

  return (
    <div
      className={
        compact
          ? 'rounded-lg border border-border bg-muted/30 p-3'
          : 'rounded-lg border border-border bg-card p-4'
      }
    >
      <p className="m-0 text-sm font-semibold text-foreground">Check delivery</p>
      <div className="mt-2 flex gap-2">
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="PIN code"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && void handleCheck()}
          className="h-9 max-w-[8rem]"
          aria-label="Delivery PIN code"
        />
        <Button type="button" size="sm" variant="outline" disabled={isFetching} onClick={() => void handleCheck()}>
          {isFetching ? 'Checking…' : 'Check'}
        </Button>
      </div>
      {error && <p className="m-0 mt-2 text-xs text-destructive">{error}</p>}
      {estimate && (
        <p className="m-0 mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-primary">
            {estimate.isFastDelivery ? 'Fast delivery' : 'Standard delivery'}
          </span>
          {' · '}
          Delivery by <strong className="text-foreground">{estimate.deliveryLabel}</strong> to{' '}
          {estimate.city} ({estimate.pincode})
        </p>
      )}
    </div>
  );
}
