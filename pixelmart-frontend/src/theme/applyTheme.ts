import { THEME_PRESETS, type ThemeMode, type ThemePresetId } from './presets';

const BRAND = {
  light: { brand: '#0875d4', brandDark: '#065baa', onBrand: '#ffffff' },
  dark: { brand: '#1a8fe8', brandDark: '#0d74c2', onBrand: '#ffffff' },
};

export function applyTheme(presetId: ThemePresetId, mode: ThemeMode, primaryOverride?: string) {
  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0];
  const colors = mode === 'dark' ? preset.dark : preset.light;
  const brand = mode === 'dark' ? BRAND.dark : BRAND.light;

  const root = document.documentElement;
  root.setAttribute('data-theme-preset', presetId);
  root.setAttribute('data-theme-mode', mode);

  // Primary is for buttons/links — admin may override; brand bar stays fixed
  const primary = primaryOverride ?? colors.primary;
  const primaryFg = mode === 'dark' && !primaryOverride ? colors.primaryForeground : '#ffffff';

  root.style.setProperty('--color-brand', brand.brand);
  root.style.setProperty('--color-brand-dark', brand.brandDark);
  root.style.setProperty('--color-on-brand', brand.onBrand);
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-foreground', primaryFg);
  root.style.setProperty('--primary-foreground', primaryFg);
  root.style.setProperty('--color-accent', '#ffc107');
  root.style.setProperty('--color-accent-foreground', '#1a1a1a');
}
