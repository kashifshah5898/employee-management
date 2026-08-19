import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { THEME_KEY } from '../hooks/useTheme';
import { givenEmployees, makeEmployee, renderPage } from './utils';

const theme = () => document.documentElement.dataset.theme;

describe('colour theme', () => {
  it('defaults to following the system and can be switched', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();

    // The stub reports a light system preference.
    await waitFor(() => expect(theme()).toBe('light'));

    await user.click(screen.getByRole('button', { name: 'Dark theme' }));

    await waitFor(() => expect(theme()).toBe('dark'));
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Dark theme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Light theme' }));
    await waitFor(() => expect(theme()).toBe('light'));
  });

  it('restores the saved preference on load', async () => {
    givenEmployees([makeEmployee()]);
    window.localStorage.setItem(THEME_KEY, 'dark');
    renderPage();

    await waitFor(() => expect(theme()).toBe('dark'));
  });

  it('ignores a junk stored value rather than breaking the page', async () => {
    givenEmployees([makeEmployee()]);
    window.localStorage.setItem(THEME_KEY, 'neon');
    renderPage();

    await waitFor(() => expect(theme()).toBe('light'));
    expect(screen.getByRole('button', { name: 'Match system theme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
