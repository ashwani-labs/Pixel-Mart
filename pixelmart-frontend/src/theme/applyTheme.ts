import { THEME_PRESETS, type ThemeMode, type ThemePresetId } from './presets';

export function applyTheme(presetId: ThemePresetId, mode: ThemeMode, primaryOverride?: string) {
  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0];
  const colors = mode === 'dark' ? preset.dark : preset.light;

  document.documentElement.setAttribute('data-theme-preset', presetId);
  document.documentElement.setAttribute('data-theme-mode', mode);

  const primary = primaryOverride ?? colors.primary;
  document.documentElement.style.setProperty('--primary', primary);
  document.documentElement.style.setProperty('--primary-foreground', colors.primaryForeground);
  document.documentElement.style.setProperty('--color-primary', primary);
  document.documentElement.style.setProperty('--color-primary-foreground', colors.primaryForeground);
}
