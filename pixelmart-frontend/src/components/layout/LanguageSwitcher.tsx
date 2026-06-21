import { useTranslation } from 'react-i18next';
import { setAppLocale } from '@/i18n';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();

  const current = i18n.language === 'hi' ? 'hi' : 'en';

  return (
    <label className={`flex items-center gap-1.5 text-on-brand ${compact ? 'text-xs' : 'text-sm'}`}>
      {!compact && <span className="hidden sm:inline opacity-90">{t('common.language')}</span>}
      <select
        value={current}
        onChange={(e) => setAppLocale(e.target.value as 'en' | 'hi')}
        className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-on-brand text-sm font-medium cursor-pointer"
        aria-label={t('common.language')}
      >
        <option value="en" className="text-foreground">EN</option>
        <option value="hi" className="text-foreground">हि</option>
      </select>
    </label>
  );
}
