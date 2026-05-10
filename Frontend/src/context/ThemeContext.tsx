import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export type BackgroundStyle = 'default' | 'midnight' | 'amoled' | 'glass' | 'gradient';
export type CardStyle = 'flat' | 'glass' | 'elevated' | 'neon' | 'minimal';
export type FontStyle = 'Inter' | 'Outfit' | 'Poppins' | 'Space Grotesk' | 'Manrope';

export type CustomThemeSettings = {
  primaryColor: string;
  backgroundStyle: BackgroundStyle;
  cardStyle: CardStyle;
  borderRadius: string; // in rem
  fontStyle: FontStyle;
  sidebarStyle: 'compact' | 'expanded' | 'floating' | 'glass';
  glassBlur: number;
  glassTransparency: number;
  noiseOpacity: number;
  glowIntensity: number;
};

type ThemeContextValue = {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  settings: CustomThemeSettings;
  updateSettings: (newSettings: Partial<CustomThemeSettings>) => void;
  resetToDefault: () => void;
};

const THEME_STORAGE_KEY = 'skillsync.theme';
const SETTINGS_STORAGE_KEY = 'skillsync.settings';

const DEFAULT_SETTINGS: CustomThemeSettings = {
  primaryColor: '#8b5cf6',
  backgroundStyle: 'default',
  cardStyle: 'glass',
  borderRadius: '0.6',
  fontStyle: 'Outfit',
  sidebarStyle: 'expanded',
  glassBlur: 16,
  glassTransparency: 0.1,
  noiseOpacity: 0.05,
  glowIntensity: 0.5,
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return (stored === 'light' || stored === 'dark') ? stored : 'light';
};

const getInitialSettings = (): CustomThemeSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [settings, setSettings] = useState<CustomThemeSettings>(getInitialSettings);

  // Apply Theme Mode (Dark/Light)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', theme === 'dark');
    root.classList.toggle('theme-light', theme === 'light');
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Apply Custom Settings via CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Primary Color
    root.style.setProperty('--color-primary', settings.primaryColor);
    
    // Border Radius
    root.style.setProperty('--radius', `${settings.borderRadius}rem`);
    root.style.setProperty('--radius-lg', `${parseFloat(settings.borderRadius) + 0.25}rem`);
    root.style.setProperty('--radius-xl', `${parseFloat(settings.borderRadius) + 0.65}rem`);
    
    // Fonts
    const fontStack = settings.fontStyle === 'Space Grotesk' 
      ? `'Space Grotesk', sans-serif` 
      : `'${settings.fontStyle}', sans-serif`;
    root.style.setProperty('--font-sans', fontStack);
    
    // Background Styles
    if (theme === 'dark') {
      if (settings.backgroundStyle === 'midnight') {
        root.style.setProperty('--color-surface', '#0a0a0f');
        root.style.setProperty('--color-surface-container-low', '#0f0f18');
      } else if (settings.backgroundStyle === 'amoled') {
        root.style.setProperty('--color-surface', '#000000');
        root.style.setProperty('--color-surface-container-low', '#050505');
      } else if (settings.backgroundStyle === 'gradient') {
        root.style.setProperty('--color-surface', '#0a0514');
        root.style.setProperty('--app-bg-glow-a', settings.primaryColor + '44');
        root.style.setProperty('--app-bg-glow-b', '#ec489944');
      } else if (settings.backgroundStyle === 'glass') {
        root.style.setProperty('--color-surface', 'rgba(10, 5, 20, 0.95)');
        root.style.setProperty('--color-surface-container-low', 'rgba(21, 14, 42, 0.8)');
      } else {
        root.style.setProperty('--color-surface', '#0a0514');
        root.style.setProperty('--color-surface-container-low', '#150e2a');
      }
    }

    // Advanced Effects
    root.style.setProperty('--glass-blur', `${settings.glassBlur}px`);
    root.style.setProperty('--glass-transparency', `${settings.glassTransparency}`);
    root.style.setProperty('--noise-opacity', `${settings.noiseOpacity}`);
    root.style.setProperty('--glow-intensity', `${settings.glowIntensity}`);

    // Card Styles
    const rootStyle = root.style;
    if (settings.cardStyle === 'glass') {
      rootStyle.setProperty('--card-bg', `rgba(255, 255, 255, ${settings.glassTransparency})`);
      rootStyle.setProperty('--card-blur', `${settings.glassBlur}px`);
      rootStyle.setProperty('--card-border-color', 'rgba(255, 255, 255, 0.1)');
      rootStyle.setProperty('--card-shadow', '0 8px 32px 0 rgba(0, 0, 0, 0.37)');
    } else if (settings.cardStyle === 'neon') {
      rootStyle.setProperty('--card-bg', 'rgba(0, 0, 0, 0.2)');
      rootStyle.setProperty('--card-border-color', settings.primaryColor);
      rootStyle.setProperty('--card-shadow', `0 0 ${10 * settings.glowIntensity}px ${settings.primaryColor}33`);
      rootStyle.setProperty('--card-blur', '4px');
    } else if (settings.cardStyle === 'elevated') {
      rootStyle.setProperty('--card-bg', theme === 'dark' ? '#1e1e2e' : '#ffffff');
      rootStyle.setProperty('--card-shadow', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');
      rootStyle.setProperty('--card-blur', 'none');
    } else {
      rootStyle.setProperty('--card-bg', ''); // Fallback to default
      rootStyle.setProperty('--card-blur', 'none');
      rootStyle.setProperty('--card-shadow', 'none');
      rootStyle.setProperty('--card-border-color', '');
    }

    // Persist
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
      settings,
      updateSettings: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings })),
      resetToDefault: () => setSettings(DEFAULT_SETTINGS),
    }),
    [theme, settings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
