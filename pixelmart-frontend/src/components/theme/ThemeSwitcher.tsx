import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setMode, setPreset } from '../../store/slices/themeSlice';
import { THEME_PRESETS, type ThemeMode, type ThemePresetId } from '../../theme/presets';

export function ThemeSwitcher() {
  const dispatch = useDispatch();
  const { presetId, mode } = useSelector((s: RootState) => s.theme);

  return (
    <div className="flex items-center gap-2">
      <select
        className="h-9 rounded-lg border border-border bg-card px-2 text-sm text-card-foreground"
        value={presetId}
        onChange={(e) => dispatch(setPreset(e.target.value as ThemePresetId))}
        aria-label="Theme preset"
      >
        {THEME_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-card-foreground hover:border-primary hover:text-primary"
        onClick={() => dispatch(setMode(mode === 'light' ? 'dark' : ('light' as ThemeMode)))}
        aria-label="Toggle light or dark mode"
      >
        {mode === 'light' ? '☀' : '☾'}
      </button>
    </div>
  );
}
