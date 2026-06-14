import { THEME_PRESETS, type ThemeMode, type ThemePresetId } from './presets';

const BRAND = {
  light: { brand: '#0875d4', brandDark: '#065baa', onBrand: '#ffffff' },
  dark: { brand: '#1a8fe8', brandDark: '#0d74c2', onBrand: '#ffffff' },
};

const SURFACES = {
  light: {
    background: '#f0f4f8',
    foreground: '#1e293b',
    card: '#ffffff',
    cardForeground: '#1e293b',
    muted: '#e8eef4',
    mutedForeground: '#5c6b7a',
    border: '#d4dde8',
    input: '#ffffff',
  },
  dark: {
    background: '#0f1419',
    foreground: '#e8edf4',
    card: '#1a2332',
    cardForeground: '#f1f5f9',
    muted: '#243044',
    mutedForeground: '#94a3b8',
    border: '#3d4f66',
    input: '#243044',
  },
};

function setVar(root: HTMLElement, name: string, value: string) {
  root.style.setProperty(name, value);
}

export function applyTheme(presetId: ThemePresetId, mode: ThemeMode, primaryOverride?: string) {
  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0];
  const colors = mode === 'dark' ? preset.dark : preset.light;
  const brand = mode === 'dark' ? BRAND.dark : BRAND.light;
  const surface = mode === 'dark' ? SURFACES.dark : SURFACES.light;

  const root = document.documentElement;
  root.setAttribute('data-theme-preset', presetId);
  root.setAttribute('data-theme-mode', mode);

  const primary = primaryOverride ?? colors.primary;
  const primaryFg =
    mode === 'dark' && !primaryOverride ? colors.primaryForeground : '#ffffff';

  setVar(root, '--color-brand', brand.brand);
  setVar(root, '--color-brand-dark', brand.brandDark);
  setVar(root, '--color-on-brand', brand.onBrand);
  setVar(root, '--color-background', surface.background);
  setVar(root, '--color-foreground', surface.foreground);
  setVar(root, '--color-card', surface.card);
  setVar(root, '--color-card-foreground', surface.cardForeground);
  setVar(root, '--color-muted', surface.muted);
  setVar(root, '--color-muted-foreground', surface.mutedForeground);
  setVar(root, '--color-border', surface.border);
  setVar(root, '--color-input', surface.input);
  setVar(root, '--color-primary', primary);
  setVar(root, '--color-primary-foreground', primaryFg);
  setVar(root, '--color-ring', primary);
  setVar(root, '--primary', primary);
  setVar(root, '--primary-foreground', primaryFg);
  setVar(root, '--color-accent', '#ffc107');
  setVar(root, '--color-accent-foreground', '#1a1a1a');
  setVar(root, '--background', surface.background);
  setVar(root, '--foreground', surface.foreground);
  setVar(root, '--card', surface.card);
  setVar(root, '--card-foreground', surface.cardForeground);
  setVar(root, '--muted', surface.muted);
  setVar(root, '--muted-foreground', surface.mutedForeground);
  setVar(root, '--border', surface.border);
  setVar(root, '--input', surface.input);
}
