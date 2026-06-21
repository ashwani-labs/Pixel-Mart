export type ThemePresetId = 'dmart' | 'pixel' | 'ocean' | 'sunset' | 'forest' | 'mono';
export type ThemeMode = 'light' | 'dark';

export interface ThemePresetColors {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  light: ThemePresetColors;
  dark: ThemePresetColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'dmart',
    label: 'Retail Blue',
    light: {
      primary: '#0875d4',
      primaryForeground: '#ffffff',
      accent: '#ffc107',
      accentForeground: '#1a1a1a',
    },
    dark: {
      primary: '#4db0f5',
      primaryForeground: '#0f172a',
      accent: '#ffc107',
      accentForeground: '#1a1a1a',
    },
  },
  {
    id: 'pixel',
    label: 'Pixel',
    light: {
      primary: '#6366f1',
      primaryForeground: '#ffffff',
      accent: '#f59e0b',
      accentForeground: '#1a1a1a',
    },
    dark: {
      primary: '#818cf8',
      primaryForeground: '#0f172a',
      accent: '#fbbf24',
      accentForeground: '#1a1a1a',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    light: {
      primary: '#0891b2',
      primaryForeground: '#ffffff',
      accent: '#22d3ee',
      accentForeground: '#0c4a6e',
    },
    dark: {
      primary: '#22d3ee',
      primaryForeground: '#0f172a',
      accent: '#67e8f9',
      accentForeground: '#0c4a6e',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    light: {
      primary: '#ea580c',
      primaryForeground: '#ffffff',
      accent: '#fbbf24',
      accentForeground: '#1a1a1a',
    },
    dark: {
      primary: '#fb923c',
      primaryForeground: '#0f172a',
      accent: '#fcd34d',
      accentForeground: '#1a1a1a',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    light: {
      primary: '#16a34a',
      primaryForeground: '#ffffff',
      accent: '#84cc16',
      accentForeground: '#14532d',
    },
    dark: {
      primary: '#4ade80',
      primaryForeground: '#0f172a',
      accent: '#a3e635',
      accentForeground: '#14532d',
    },
  },
  {
    id: 'mono',
    label: 'Mono',
    light: {
      primary: '#334155',
      primaryForeground: '#ffffff',
      accent: '#eab308',
      accentForeground: '#1a1a1a',
    },
    dark: {
      primary: '#94a3b8',
      primaryForeground: '#0f172a',
      accent: '#facc15',
      accentForeground: '#1a1a1a',
    },
  },
];

export const DEFAULT_PRESET_ID: ThemePresetId = 'dmart';
export const DEFAULT_MODE: ThemeMode = 'light';
