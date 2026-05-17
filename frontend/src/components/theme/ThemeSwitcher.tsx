import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setMode, setPreset } from '../../store/slices/themeSlice';
import { THEME_PRESETS, type ThemeMode, type ThemePresetId } from '../../theme/presets';
import styles from './ThemeSwitcher.module.css';

export function ThemeSwitcher() {
  const dispatch = useDispatch();
  const { presetId, mode } = useSelector((s: RootState) => s.theme);

  return (
    <div className={styles.wrap}>
      <select
        className={styles.select}
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
        className={styles.modeBtn}
        onClick={() => dispatch(setMode(mode === 'light' ? 'dark' : ('light' as ThemeMode)))}
        aria-label="Toggle light or dark mode"
      >
        {mode === 'light' ? '☀' : '☾'}
      </button>
    </div>
  );
}
