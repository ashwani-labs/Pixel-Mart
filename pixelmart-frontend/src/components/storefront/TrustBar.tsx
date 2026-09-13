import { useTranslation } from 'react-i18next';

export function TrustBar() {
  const { t } = useTranslation();
  const items = [
    { icon: '🚚', label: t('trust.freeDelivery'), detail: t('trust.freeDeliveryDetail') },
    { icon: '↩️', label: t('trust.easyReturns'), detail: t('trust.easyReturnsDetail') },
    { icon: '🔒', label: t('trust.secureCheckout'), detail: t('trust.secureCheckoutDetail') },
    { icon: '🏷️', label: t('trust.bestPrices'), detail: t('trust.bestPricesDetail') },
  ] as const;

  return (
    <div className="border-b border-border bg-brand-subtle">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-2 text-xs sm:text-sm">
        {items.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-2 text-muted-foreground"
          >
            <span aria-hidden className="text-base">
              {item.icon}
            </span>
            <span>
              <strong className="font-semibold text-foreground">{item.label}</strong>
              <span className="hidden sm:inline"> · {item.detail}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
