import { useEffect, useState } from 'react';

export const THEME_KEY = 'ems.theme';

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const prefersDark = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

function storedPreference(): ThemePreference {
  const stored = window.localStorage.getItem(THEME_KEY);
  return THEME_PREFERENCES.includes(stored as ThemePreference)
    ? (stored as ThemePreference)
    : 'system';
}

/**
 * Light, dark, or follow the OS. The resolved theme lands on <html> as
 * data-theme, which is what the CSS variables key off — index.html applies the
 * same rule before first paint to avoid a flash.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(storedPreference);

  useEffect(() => {
    const apply = () => {
      const dark = preference === 'dark' || (preference === 'system' && prefersDark());
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();

    // Only worth listening while we are actually following the OS.
    if (preference !== 'system') return;
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener('change', apply);
    return () => media?.removeEventListener('change', apply);
  }, [preference]);

  const choose = (next: ThemePreference) => {
    window.localStorage.setItem(THEME_KEY, next);
    setPreference(next);
  };

  return { preference, choose };
}
