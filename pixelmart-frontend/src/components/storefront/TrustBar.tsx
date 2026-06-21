const TRUST_ITEMS = [
  { icon: '🚚', label: 'Free delivery', detail: 'On orders above ₹499' },
  { icon: '↩️', label: 'Easy returns', detail: '7-day hassle-free' },
  { icon: '🔒', label: 'Secure checkout', detail: 'Encrypted payments' },
  { icon: '🏷️', label: 'Best prices', detail: 'Deals every week' },
] as const;

export function TrustBar() {
  return (
    <div className="border-b border-border bg-brand-subtle">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-2 text-xs sm:text-sm">
        {TRUST_ITEMS.map((item) => (
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
