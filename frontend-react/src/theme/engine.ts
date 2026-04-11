import type { ThemeTokens } from './presets';

/**
 * Applies a ThemeTokens object to :root as CSS custom properties.
 * This is the core runtime engine — zero page reloads, instant swap.
 */
export function applyTokensToDOM(tokens: ThemeTokens) {
  const root = document.documentElement;

  // Primary palette
  root.style.setProperty('--color-primary-50', tokens.primary50);
  root.style.setProperty('--color-primary-100', tokens.primary100);
  root.style.setProperty('--color-primary-200', tokens.primary200);
  root.style.setProperty('--color-primary-300', tokens.primary300);
  root.style.setProperty('--color-primary-400', tokens.primary400);
  root.style.setProperty('--color-primary-500', tokens.primary500);
  root.style.setProperty('--color-primary-600', tokens.primary600);
  root.style.setProperty('--color-primary-700', tokens.primary700);
  root.style.setProperty('--color-primary-800', tokens.primary800);
  root.style.setProperty('--color-primary-900', tokens.primary900);
  root.style.setProperty('--color-primary-950', tokens.primary950);

  // Semantic light-mode vars
  root.style.setProperty('--bg-primary-light', tokens.bgPrimaryLight);
  root.style.setProperty('--bg-surface-light', tokens.bgSurfaceLight);
  root.style.setProperty('--bg-card-light', tokens.bgCardLight);
  root.style.setProperty('--text-primary-light', tokens.textPrimaryLight);
  root.style.setProperty('--text-muted-light', tokens.textMutedLight);
  root.style.setProperty('--border-color-light', tokens.borderColorLight);

  // Semantic dark-mode vars
  root.style.setProperty('--bg-primary-dark', tokens.bgPrimaryDark);
  root.style.setProperty('--bg-surface-dark', tokens.bgSurfaceDark);
  root.style.setProperty('--bg-card-dark', tokens.bgCardDark);
  root.style.setProperty('--text-primary-dark', tokens.textPrimaryDark);
  root.style.setProperty('--text-muted-dark', tokens.textMutedDark);
  root.style.setProperty('--border-color-dark', tokens.borderColorDark);

  // Apply mode-aware semantic tokens based on current mode
  const isDark = root.classList.contains('dark');
  applyModeTokens(tokens, isDark);

  // Geometry
  root.style.setProperty('--radius-base', tokens.borderRadius);
}

/**
 * Re-applies mode-specific tokens when dark/light mode toggles
 */
export function applyModeTokens(tokens: ThemeTokens, isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.style.setProperty('--bg-primary', tokens.bgPrimaryDark);
    root.style.setProperty('--bg-surface', tokens.bgSurfaceDark);
    root.style.setProperty('--bg-card', tokens.bgCardDark);
    root.style.setProperty('--text-primary', tokens.textPrimaryDark);
    root.style.setProperty('--text-muted', tokens.textMutedDark);
    root.style.setProperty('--border-color', tokens.borderColorDark);
  } else {
    root.style.setProperty('--bg-primary', tokens.bgPrimaryLight);
    root.style.setProperty('--bg-surface', tokens.bgSurfaceLight);
    root.style.setProperty('--bg-card', tokens.bgCardLight);
    root.style.setProperty('--text-primary', tokens.textPrimaryLight);
    root.style.setProperty('--text-muted', tokens.textMutedLight);
    root.style.setProperty('--border-color', tokens.borderColorLight);
  }
}

const STORAGE_KEY_PRESET = 'skillsync-theme-preset';
const STORAGE_KEY_CUSTOM = 'skillsync-theme-custom';

export function persistPresetId(id: string) {
  localStorage.setItem(STORAGE_KEY_PRESET, id);
  localStorage.removeItem(STORAGE_KEY_CUSTOM); // clear custom when switching to preset
}

export function persistCustomTokens(tokens: ThemeTokens) {
  localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(tokens));
  localStorage.setItem(STORAGE_KEY_PRESET, '__custom__');
}

export function loadPersistedPresetId(): string {
  return localStorage.getItem(STORAGE_KEY_PRESET) || 'default';
}

export function loadPersistedCustomTokens(): ThemeTokens | null {
  const raw = localStorage.getItem(STORAGE_KEY_CUSTOM);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ThemeTokens;
  } catch {
    return null;
  }
}
