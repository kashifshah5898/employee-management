import type { ReactElement } from 'react';
import { THEME_PREFERENCES, useTheme, type ThemePreference } from '../hooks/useTheme';
import { IconButton, MoonIcon, SunIcon, SystemIcon } from './ui';

const OPTIONS: Record<ThemePreference, { label: string; icon: () => ReactElement }> = {
  light: { label: 'Light theme', icon: SunIcon },
  dark: { label: 'Dark theme', icon: MoonIcon },
  system: { label: 'Match system theme', icon: SystemIcon },
};

export function ThemeToggle() {
  const { preference, choose } = useTheme();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5"
    >
      {THEME_PREFERENCES.map((value) => {
        const { label, icon: Icon } = OPTIONS[value];
        const selected = preference === value;
        return (
          <IconButton
            key={value}
            label={label}
            tooltip={label.replace(' theme', '')}
            aria-pressed={selected}
            onClick={() => choose(value)}
            className={`h-8 w-8 ${selected ? 'bg-surface-muted text-content' : ''}`}
          >
            <Icon />
          </IconButton>
        );
      })}
    </div>
  );
}
