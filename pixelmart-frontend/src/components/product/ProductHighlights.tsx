import { useTranslation } from 'react-i18next';
import type { ProductHighlight } from '@/types/catalog';

interface ProductHighlightsProps {
  highlights: ProductHighlight[];
}

export function ProductHighlights({ highlights }: ProductHighlightsProps) {
  const { t } = useTranslation();

  if (!highlights.length) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-foreground">{t('product.specs')}</h2>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {highlights.map((item) => (
            <tr key={`${item.label}-${item.value}`} className="border-b border-border">
              <th className="py-2 pr-4 text-left font-medium text-muted-foreground w-2/5">
                {item.label}
              </th>
              <td className="py-2 text-foreground">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
