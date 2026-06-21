import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setMode, setPreset } from '../../store/slices/themeSlice';
import { THEME_PRESETS, type ThemeMode, type ThemePresetId } from '../../theme/presets';
import { Select } from '../ui/select';

interface ThemeSwitcherProps {
  compact?: boolean;
  onBrand?: boolean;
}

export function ThemeSwitcher({ compact = false, onBrand = false }: ThemeSwitcherProps) {
  const dispatch = useDispatch();
  const { presetId, mode } = useSelector((s: RootState) => s.theme);

  const fieldClass = onBrand
    ? 'h-9 min-w-[7rem] border-white/30 bg-white/10 text-xs text-on-brand'
    : compact
      ? 'h-9 min-w-[7rem] text-xs'
      : 'min-w-[8.5rem]';

  const modeBtnClass = onBrand
    ? 'border-white/30 bg-white/10 text-on-brand hover:border-white/50 hover:bg-white/15'
    : 'border-border bg-card text-card-foreground hover:border-primary hover:text-primary';

  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'flex-wrap'}`}>
      {!compact && (
        <span className="text-xs font-medium text-muted-foreground">Theme</span>
      )}
      <Select
        className={fieldClass}
        value={presetId}
        onChange={(e) => dispatch(setPreset(e.target.value as ThemePresetId))}
        aria-label="Color preset"
      >
        {THEME_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </Select>
      <button
        type="button"
        className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm transition ${modeBtnClass}`}
        onClick={() => dispatch(setMode(mode === 'light' ? 'dark' : ('light' as ThemeMode)))}
        aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={mode === 'light' ? 'Dark mode' : 'Light mode'}
      >
        {mode === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
