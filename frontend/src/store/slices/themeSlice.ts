import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { applyTheme } from '../../theme/applyTheme';
import { loadThemeFromStorage, saveThemeToStorage } from '../../theme/storage';
import { DEFAULT_MODE, DEFAULT_PRESET_ID, type ThemeMode, type ThemePresetId } from '../../theme/presets';

const saved = loadThemeFromStorage();

interface ThemeState {
  presetId: ThemePresetId;
  mode: ThemeMode;
  adminPrimaryOverride: string | null;
}

const initialState: ThemeState = {
  presetId: saved.presetId ?? DEFAULT_PRESET_ID,
  mode: saved.mode ?? DEFAULT_MODE,
  adminPrimaryOverride: null,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setPreset(state, action: PayloadAction<ThemePresetId>) {
      state.presetId = action.payload;
      applyTheme(state.presetId, state.mode, state.adminPrimaryOverride ?? undefined);
      saveThemeToStorage(state.presetId, state.mode);
    },
    setMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      applyTheme(state.presetId, state.mode, state.adminPrimaryOverride ?? undefined);
      saveThemeToStorage(state.presetId, state.mode);
    },
    setAdminPrimaryOverride(state, action: PayloadAction<string | null>) {
      state.adminPrimaryOverride = action.payload;
      applyTheme(state.presetId, state.mode, state.adminPrimaryOverride ?? undefined);
    },
  },
});

export const { setPreset, setMode, setAdminPrimaryOverride } = themeSlice.actions;
export default themeSlice.reducer;
