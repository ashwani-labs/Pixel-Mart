import { THEME_PRESETS, type ThemeMode, type ThemePresetId } from './presets';

const SURFACE_BASE = {
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
} as const;

/** How much primary hue to blend into each surface (keeps text readable). */
const SURFACE_MIX = {
  light: { background: '7%', card: '0%', muted: '14%', border: '12%' },
  dark: { background: '11%', card: '9%', muted: '14%', border: '11%' },
} as const;

function setVar(root: HTMLElement, name: string, value: string) {
  root.style.setProperty(name, value);
}

function mix(primary: string, base: string, amount: string) {
  return `color-mix(in srgb, ${primary} ${amount}, ${base})`;
}

/** Darken a #RRGGBB hex color by multiplying RGB channels (0–1 factor). */
function darkenHex(hex: string, factor: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const r = Math.round(parseInt(normalized.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(normalized.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(normalized.slice(4, 6), 16) * factor);
  return `#${[r, g, b].map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')}`;
}

function buildSurfaces(primary: string, mode: ThemeMode) {
  const base = SURFACE_BASE[mode];
  const blend = SURFACE_MIX[mode];

  return {
    background: mix(primary, base.background, blend.background),
    foreground: base.foreground,
    card:
      blend.card === '0%' ? base.card : mix(primary, base.card, blend.card),
    cardForeground: base.cardForeground,
    muted: mix(primary, base.muted, blend.muted),
    mutedForeground: base.mutedForeground,
    border: mix(primary, base.border, blend.border),
    input: blend.card === '0%' ? base.input : mix(primary, base.input, blend.card),
  };
}

function syncSemanticAliases(
  root: HTMLElement,
  mode: ThemeMode,
  surface: ReturnType<typeof buildSurfaces>,
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
  },
) {
  const dealBg = mode === 'dark' ? '#14532d' : '#e8f5e9';
  const dealFg = mode === 'dark' ? '#86efac' : '#2e7d32';
  const success = mode === 'dark' ? '#86efac' : '#2e7d32';
  const successBg = mode === 'dark' ? '#14532d' : '#e8f5e9';

  const entries: Record<string, string> = {
    '--color-background': surface.background,
    '--color-foreground': surface.foreground,
    '--color-card': surface.card,
    '--color-card-foreground': surface.cardForeground,
    '--color-muted': surface.muted,
    '--color-muted-foreground': surface.mutedForeground,
    '--color-border': surface.border,
    '--color-input': surface.input,
    '--color-primary': colors.primary,
    '--color-primary-foreground': colors.primaryForeground,
    '--color-ring': colors.primary,
    '--color-accent': colors.accent,
    '--color-accent-foreground': colors.accentForeground,
    '--color-deal': mix(colors.primary, dealBg, '12%'),
    '--color-deal-foreground': mix(colors.primary, dealFg, '45%'),
    '--color-success': mix(colors.primary, success, '40%'),
    '--color-success-bg': mix(colors.primary, successBg, '12%'),
    '--background': surface.background,
    '--foreground': surface.foreground,
    '--card': surface.card,
    '--card-foreground': surface.cardForeground,
    '--muted': surface.muted,
    '--muted-foreground': surface.mutedForeground,
    '--border': surface.border,
    '--input': surface.input,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--ring': colors.primary,
  };

  for (const [name, value] of Object.entries(entries)) {
    setVar(root, name, value);
  }
}

export function applyTheme(presetId: ThemePresetId, mode: ThemeMode, primaryOverride?: string) {
  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0];
  const colors = mode === 'dark' ? preset.dark : preset.light;
  const primary = primaryOverride ?? colors.primary;

  const root = document.documentElement;
  root.setAttribute('data-theme-preset', presetId);
  root.setAttribute('data-theme-mode', mode);

  const surface = buildSurfaces(primary, mode);
  const brandDark = darkenHex(primary, 0.78);

  setVar(root, '--color-brand', primary);
  setVar(root, '--color-brand-dark', brandDark);
  setVar(root, '--color-on-brand', '#ffffff');

  syncSemanticAliases(root, mode, surface, {
    primary,
    primaryForeground: colors.primaryForeground,
    accent: colors.accent,
    accentForeground: colors.accentForeground,
  });
}
