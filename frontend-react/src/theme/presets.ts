export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeTokens {
  // Primary colors
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;
  primary950: string;

  // Background/Surface variables (light mode usually)
  bgPrimaryLight: string;
  bgSurfaceLight: string;
  bgCardLight: string;
  textPrimaryLight: string;
  textMutedLight: string;
  borderColorLight: string;

  // Background/Surface variables (dark mode usually)
  bgPrimaryDark: string;
  bgSurfaceDark: string;
  bgCardDark: string;
  textPrimaryDark: string;
  textMutedDark: string;
  borderColorDark: string;

  // Geometry
  borderRadius: string; // sm, md, lg, xl, full, etc.
}

export interface ThemePreset {
  id: string;
  name: string;
  tokens: ThemeTokens;
}

export const PRESETS: Record<string, ThemePreset> = {
  default: {
    id: 'default',
    name: 'Modern Purple',
    tokens: {
      primary50: '#f5f3ff',
      primary100: '#ede9fe',
      primary200: '#ddd6fe',
      primary300: '#c4b5fd',
      primary400: '#a78bfa',
      primary500: '#8b5cf6',
      primary600: '#7c3aed',
      primary700: '#6d28d9',
      primary800: '#5b21b6',
      primary900: '#4c1d95',
      primary950: '#2e1065',
      
      bgPrimaryLight: '#f8fafc',
      bgSurfaceLight: '#f1f5f9',
      bgCardLight: '#ffffff',
      textPrimaryLight: '#0f172a',
      textMutedLight: '#64748b',
      borderColorLight: '#e2e8f0',
      
      bgPrimaryDark: '#020617',
      bgSurfaceDark: '#0f172a',
      bgCardDark: '#1e293b',
      textPrimaryDark: '#f8fafc',
      textMutedDark: '#94a3b8',
      borderColorDark: '#334155',
      
      borderRadius: '1rem',
    }
  },
  glassBlue: {
    id: 'glassBlue',
    name: 'Glass Blue',
    tokens: {
      primary50: '#eff6ff',
      primary100: '#dbeafe',
      primary200: '#bfdbfe',
      primary300: '#93c5fd',
      primary400: '#60a5fa',
      primary500: '#3b82f6',
      primary600: '#2563eb',
      primary700: '#1d4ed8',
      primary800: '#1e40af',
      primary900: '#1e3a8a',
      primary950: '#172554',
      
      bgPrimaryLight: '#f0f9ff',
      bgSurfaceLight: '#e0f2fe',
      bgCardLight: '#ffffff',
      textPrimaryLight: '#082f49',
      textMutedLight: '#0ea5e9',
      borderColorLight: '#bae6fd',
      
      bgPrimaryDark: '#082f49',
      bgSurfaceDark: '#0c4a6e',
      bgCardDark: '#075985',
      textPrimaryDark: '#f0f9ff',
      textMutedDark: '#38bdf8',
      borderColorDark: '#0369a1',
      
      borderRadius: '1.5rem',
    }
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Black',
    tokens: {
      primary50: '#f6f6f6',
      primary100: '#e7e7e7',
      primary200: '#d1d1d1',
      primary300: '#b0b0b0',
      primary400: '#888888',
      primary500: '#6d6d6d',
      primary600: '#5d5d5d',
      primary700: '#4f4f4f',
      primary800: '#454545',
      primary900: '#3d3d3d',
      primary950: '#262626',
      
      bgPrimaryLight: '#ffffff',
      bgSurfaceLight: '#f4f4f5',
      bgCardLight: '#fafafa',
      textPrimaryLight: '#000000',
      textMutedLight: '#71717a',
      borderColorLight: '#e4e4e7',
      
      bgPrimaryDark: '#000000',
      bgSurfaceDark: '#09090b',
      bgCardDark: '#18181b',
      textPrimaryDark: '#ffffff',
      textMutedDark: '#a1a1aa',
      borderColorDark: '#27272a',
      
      borderRadius: '0.5rem',
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Eco Emerald',
    tokens: {
      primary50: '#ecfdf5',
      primary100: '#d1fae5',
      primary200: '#a7f3d0',
      primary300: '#6ee7b7',
      primary400: '#34d399',
      primary500: '#10b981',
      primary600: '#059669',
      primary700: '#047857',
      primary800: '#065f46',
      primary900: '#064e3b',
      primary950: '#022c22',
      
      bgPrimaryLight: '#f8fafc',
      bgSurfaceLight: '#f1f5f9',
      bgCardLight: '#ffffff',
      textPrimaryLight: '#0f172a',
      textMutedLight: '#64748b',
      borderColorLight: '#e2e8f0',
      
      bgPrimaryDark: '#022c22',
      bgSurfaceDark: '#064e3b',
      bgCardDark: '#065f46',
      textPrimaryDark: '#ecfdf5',
      textMutedDark: '#6ee7b7',
      borderColorDark: '#047857',
      
      borderRadius: '2rem', // extremely rounded 
    }
  }
};
