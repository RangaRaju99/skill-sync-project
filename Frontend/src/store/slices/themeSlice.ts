import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppTheme, ThemeHistory } from '../../types/theme';

const DEFAULT_THEME: AppTheme = {
  id: 'skillsync-amethyst',
  name: 'Amethyst Night',
  mode: 'light',
  colors: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: '#faf9ff',
    surface: '#ffffff',
    text: '#1e1b4b',
    textSecondary: '#4c1d95',
    border: '#c4b5fd',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
  },
  typography: {
    fontFamily: "'Outfit', sans-serif",
    headingFontFamily: "'Outfit', sans-serif",
    baseFontSize: 16,
  },
  components: {
    buttonRadius: '0.6rem',
    cardRadius: '0.85rem',
    cardShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -2px rgba(139, 92, 246, 0.05)',
    inputRadius: '0.5rem',
    glassmorphism: true,
    animationSpeed: 1,
  },
  layout: {
    density: 'comfortable',
    containerWidth: '1280px',
  },
};

const NEON_THEME: AppTheme = {
  id: 'preset-neon',
  name: 'Cyber Neon',
  mode: 'dark',
  colors: {
    primary: '#0ea5e9',
    secondary: '#f43f5e',
    accent: '#d946ef',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f43f5e',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
  },
  typography: {
    fontFamily: "'JetBrains Mono', monospace",
    headingFontFamily: "'Inter', sans-serif",
    baseFontSize: 16,
  },
  components: {
    buttonRadius: '4px',
    cardRadius: '0px',
    cardShadow: '0 0 15px rgba(14, 165, 233, 0.3)',
    inputRadius: '0px',
    glassmorphism: true,
    animationSpeed: 0.8,
  },
  layout: {
    density: 'compact',
    containerWidth: '1400px',
  },
};

const HACKER_THEME: AppTheme = {
  id: 'preset-hacker',
  name: 'Hacker Terminal',
  mode: 'dark',
  colors: {
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#10b981',
    background: '#000000',
    surface: '#050505',
    text: '#22c55e',
    textSecondary: '#166534',
    border: '#14532d',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
  },
  typography: {
    fontFamily: "'JetBrains Mono', monospace",
    headingFontFamily: "'JetBrains Mono', monospace",
    baseFontSize: 14,
  },
  components: {
    buttonRadius: '2px',
    cardRadius: '2px',
    cardShadow: '0 0 10px rgba(34, 197, 94, 0.2)',
    inputRadius: '2px',
    glassmorphism: false,
    animationSpeed: 0.5,
  },
  layout: {
    density: 'compact',
    containerWidth: '100%',
  },
};

const CORPORATE_THEME: AppTheme = {
  id: 'preset-corporate',
  name: 'Enterprise Blue',
  mode: 'light',
  colors: {
    primary: '#1e40af',
    secondary: '#334155',
    accent: '#0369a1',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    border: '#cbd5e1',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    headingFontFamily: "'Inter', sans-serif",
    baseFontSize: 16,
  },
  components: {
    buttonRadius: '4px',
    cardRadius: '4px',
    cardShadow: '0 1px 3px rgba(0,0,0,0.1)',
    inputRadius: '4px',
    glassmorphism: false,
    animationSpeed: 1,
  },
  layout: {
    density: 'comfortable',
    containerWidth: '1100px',
  },
};

interface ThemeState extends ThemeHistory {
  customThemes: AppTheme[];
}

const getInitialState = (): ThemeState => {
  const stored = localStorage.getItem('skillsync_custom_themes');
  const customThemes = stored ? JSON.parse(stored) : [];
  
  const currentStored = localStorage.getItem('skillsync_current_theme');
  const present = currentStored ? JSON.parse(currentStored) : DEFAULT_THEME;

  return {
    past: [],
    present,
    future: [],
    customThemes,
  };
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: getInitialState(),
  reducers: {
    updateTheme: (state, action: PayloadAction<Partial<AppTheme>>) => {
      state.past.push({ ...state.present });
      state.present = { ...state.present, ...action.payload };
      state.future = [];
      localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
    },
    updateColors: (state, action: PayloadAction<Partial<AppTheme['colors']>>) => {
      state.past.push({ ...state.present });
      state.present.colors = { ...state.present.colors, ...action.payload };
      state.future = [];
      localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
    },
    updateTypography: (state, action: PayloadAction<Partial<AppTheme['typography']>>) => {
      state.past.push({ ...state.present });
      state.present.typography = { ...state.present.typography, ...action.payload };
      state.future = [];
      localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
    },
    updateComponents: (state, action: PayloadAction<Partial<AppTheme['components']>>) => {
      state.past.push({ ...state.present });
      state.present.components = { ...state.present.components, ...action.payload };
      state.future = [];
      localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
    },
    updateLayout: (state, action: PayloadAction<Partial<AppTheme['layout']>>) => {
      state.past.push({ ...state.present });
      state.present.layout = { ...state.present.layout, ...action.payload };
      state.future = [];
      localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past.pop();
        if (previous) {
          state.future.unshift({ ...state.present });
          state.present = previous;
          localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
        }
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future.shift();
        if (next) {
          state.past.push({ ...state.present });
          state.present = next;
          localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
        }
      }
    },
    setPresetTheme: (state, action: PayloadAction<'minimal' | 'neon' | 'hacker' | 'corporate' | 'auto'>) => {
      state.past.push({ ...state.present });
      
      let nextTheme: AppTheme;
      switch(action.payload) {
        case 'neon': nextTheme = NEON_THEME; break;
        case 'hacker': nextTheme = HACKER_THEME; break;
        case 'corporate': nextTheme = CORPORATE_THEME; break;
        case 'auto': 
          const isNight = new Date().getHours() >= 19 || new Date().getHours() < 7;
          nextTheme = isNight ? NEON_THEME : DEFAULT_THEME;
          break;
        default: nextTheme = DEFAULT_THEME;
      }
      
      state.present = nextTheme;
      state.future = [];
      localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
    },
    resetTheme: (state) => {
      state.past.push({ ...state.present });
      state.present = DEFAULT_THEME;
      state.future = [];
      localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
    },
    importTheme: (state, action: PayloadAction<AppTheme>) => {
      state.past.push({ ...state.present });
      state.present = action.payload;
      state.future = [];
      localStorage.setItem('skillsync_current_theme', JSON.stringify(state.present));
    }
  },
});

export const { 
  updateTheme, 
  updateColors, 
  updateTypography, 
  updateComponents, 
  updateLayout,
  undo, 
  redo, 
  setPresetTheme,
  resetTheme,
  importTheme
} = themeSlice.actions;

export default themeSlice.reducer;
