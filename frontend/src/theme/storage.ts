import { DEFAULT_MODE, DEFAULT_PRESET_ID, type ThemeMode, type ThemePresetId } from './presets';

const PRESET_KEY = 'pixelmart.themePreset';
const MODE_KEY = 'pixelmart.colorMode';

export function loadThemeFromStorage(): { presetId: ThemePresetId; mode: ThemeMode } {
  const presetId = (localStorage.getItem(PRESET_KEY) as ThemePresetId) || DEFAULT_PRESET_ID;
  const mode = (localStorage.getItem(MODE_KEY) as ThemeMode) || DEFAULT_MODE;
  return { presetId, mode };
}

export function saveThemeToStorage(presetId: ThemePresetId, mode: ThemeMode) {
  localStorage.setItem(PRESET_KEY, presetId);
  localStorage.setItem(MODE_KEY, mode);
}
