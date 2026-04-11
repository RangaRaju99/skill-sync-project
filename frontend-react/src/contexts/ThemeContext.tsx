import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ThemeTokens, ThemePreset } from '../theme/presets';
import { PRESETS } from '../theme/presets';
import {
  applyTokensToDOM,
  applyModeTokens,
  persistPresetId,
  persistCustomTokens,
  loadPersistedPresetId,
  loadPersistedCustomTokens,
} from '../theme/engine';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextState {
  // Dark / Light
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  resolvedMode: 'dark' | 'light'; // after resolving 'system'

  // Preset engine
  activePresetId: string;
  switchPreset: (id: string) => void;
  activeTokens: ThemeTokens;

  // Custom theme
  applyCustomTokens: (tokens: ThemeTokens) => void;

  // All available presets
  presets: Record<string, ThemePreset>;
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

function resolveSystemMode(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const STORAGE_MODE_KEY = 'skill-sync-ui-theme';

  // ── Dark / light ──────────────────────────────────────────────
  const [mode, setModeRaw] = useState<ThemeMode>(
    () => (localStorage.getItem(STORAGE_MODE_KEY) as ThemeMode) || 'system'
  );

  const resolvedMode = useMemo<'dark' | 'light'>(
    () => (mode === 'system' ? resolveSystemMode() : mode),
    [mode]
  );

  const setMode = useCallback((m: ThemeMode) => {
    localStorage.setItem(STORAGE_MODE_KEY, m);
    setModeRaw(m);
  }, []);

  // ── Presets ───────────────────────────────────────────────────
  const [activePresetId, setActivePresetId] = useState<string>(() => loadPersistedPresetId());
  const [customTokens, setCustomTokens] = useState<ThemeTokens | null>(() => loadPersistedCustomTokens());

  const activeTokens = useMemo<ThemeTokens>(() => {
    if (activePresetId === '__custom__' && customTokens) return customTokens;
    return (PRESETS[activePresetId] || PRESETS.default).tokens;
  }, [activePresetId, customTokens]);

  const switchPreset = useCallback((id: string) => {
    setActivePresetId(id);
    persistPresetId(id);
    setCustomTokens(null);
  }, []);

  const applyCustomTokens = useCallback((tokens: ThemeTokens) => {
    setCustomTokens(tokens);
    setActivePresetId('__custom__');
    persistCustomTokens(tokens);
  }, []);

  // ── Apply tokens to DOM whenever tokens or mode change ────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedMode);
    applyTokensToDOM(activeTokens);
  }, [activeTokens, resolvedMode]);

  // Re-apply mode-specific semantic vars when dark/light toggles
  useEffect(() => {
    applyModeTokens(activeTokens, resolvedMode === 'dark');
  }, [resolvedMode, activeTokens]);

  // Listen for system preference changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = resolveSystemMode();
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      applyModeTokens(activeTokens, resolved === 'dark');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, activeTokens]);

  const value = useMemo<ThemeContextState>(
    () => ({
      mode,
      setMode,
      resolvedMode,
      activePresetId,
      switchPreset,
      activeTokens,
      applyCustomTokens,
      presets: PRESETS,
    }),
    [mode, setMode, resolvedMode, activePresetId, switchPreset, activeTokens, applyCustomTokens]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
