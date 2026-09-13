import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { estimateDelivery } from '@/lib/deliveryEstimate';
import { readDeliveryPin, saveDeliveryPin } from '@/lib/deliveryPinStorage';
import { useLazyLookupPincodeQuery } from '@/store/api/orderApi';

interface DeliveryEstimateProps {
  compact?: boolean;
}

export function DeliveryEstimate({ compact = false }: DeliveryEstimateProps) {
  const { t } = useTranslation();
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
      setError(t('delivery.invalidPin'));
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
      setError(t('delivery.verifyFailed'));
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
      <p className="m-0 text-sm font-semibold text-foreground">{t('delivery.check')}</p>
      <div className="mt-2 flex gap-2">
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t('delivery.pincode')}
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && void handleCheck()}
          className="h-9 max-w-[8rem]"
          aria-label={t('delivery.pincode')}
        />
        <Button type="button" size="sm" variant="outline" disabled={isFetching} onClick={() => void handleCheck()}>
          {isFetching ? t('delivery.checking') : t('delivery.checkBtn')}
        </Button>
      </div>
      {error && <p className="m-0 mt-2 text-xs text-destructive">{error}</p>}
      {estimate && (
        <p className="m-0 mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-primary">
            {estimate.isFastDelivery ? t('delivery.fast') : t('delivery.standard')}
          </span>
          {' · '}
          {t('delivery.byTo', { date: estimate.deliveryLabel, city: estimate.city, pin: estimate.pincode })}
        </p>
      )}
    </div>
  );
}
