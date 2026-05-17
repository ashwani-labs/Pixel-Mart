export type ThemePresetId = 'pixel' | 'ocean' | 'sunset' | 'forest' | 'mono';
export type ThemeMode = 'light' | 'dark';

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  light: { primary: string; primaryForeground: string };
  dark: { primary: string; primaryForeground: string };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'pixel',
    label: 'Pixel',
    light: { primary: '#6366f1', primaryForeground: '#ffffff' },
    dark: { primary: '#818cf8', primaryForeground: '#0f172a' },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    light: { primary: '#0891b2', primaryForeground: '#ffffff' },
    dark: { primary: '#22d3ee', primaryForeground: '#0f172a' },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    light: { primary: '#ea580c', primaryForeground: '#ffffff' },
    dark: { primary: '#fb923c', primaryForeground: '#0f172a' },
  },
  {
    id: 'forest',
    label: 'Forest',
    light: { primary: '#16a34a', primaryForeground: '#ffffff' },
    dark: { primary: '#4ade80', primaryForeground: '#0f172a' },
  },
  {
    id: 'mono',
    label: 'Mono',
    light: { primary: '#334155', primaryForeground: '#ffffff' },
    dark: { primary: '#94a3b8', primaryForeground: '#0f172a' },
  },
];

export const DEFAULT_PRESET_ID: ThemePresetId = 'pixel';
export const DEFAULT_MODE: ThemeMode = 'light';
