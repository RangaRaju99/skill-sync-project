import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { getContrastColor, hexToRgba } from '../utils/themeUtils';

export const useThemeEngine = () => {
  const theme = useSelector((state: RootState) => state.theme.present);

  useEffect(() => {
    const root = document.documentElement;
    const { colors, typography, components, layout } = theme;

    // --- Colors ---
    // Mapping to your original index.css variable names
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-surface', colors.background);
    root.style.setProperty('--color-surface-container-lowest', colors.surface);
    root.style.setProperty('--color-on-surface', colors.text);
    root.style.setProperty('--color-on-surface-variant', colors.textSecondary);
    root.style.setProperty('--color-outline-variant', colors.border);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-error', colors.error);
    
    // Gradient support (used in your buttons)
    root.style.setProperty('--gradient-btn-start', colors.primary);
    root.style.setProperty('--gradient-btn-end', colors.accent);

    // Dynamic glow support for your original background
    root.style.setProperty('--app-bg-glow-a', `${colors.primary}24`); // 14% opacity
    root.style.setProperty('--app-bg-glow-b', `${colors.accent}1A`);  // 10% opacity

    // --- Typography ---
    root.style.setProperty('--font-sans', typography.fontFamily);
    root.style.setProperty('--base-font-size', `${typography.baseFontSize}px`);

    // --- Components ---
    root.style.setProperty('--radius-xl', components.buttonRadius);
    root.style.setProperty('--radius-full', components.cardRadius);
    
    const transitionTime = 0.3 * components.animationSpeed;
    root.style.setProperty('--transition-speed', `${transitionTime}s`);

    if (components.glassmorphism) {
      root.style.setProperty('--glass-bg', hexToRgba(colors.surface, 0.7));
      root.style.setProperty('--glass-border', hexToRgba(colors.border, 0.5));
      root.style.setProperty('--glass-blur', '12px');
    } else {
      root.style.setProperty('--glass-bg', colors.surface);
      root.style.setProperty('--glass-border', colors.border);
      root.style.setProperty('--glass-blur', '0px');
    }

    // --- Layout ---
    const densityMap = {
      compact: { padding: '8px', gap: '12px' },
      comfortable: { padding: '16px', gap: '24px' },
      spacious: { padding: '32px', gap: '48px' },
    };
    root.style.setProperty('--layout-padding', densityMap[layout.density].padding);
    root.style.setProperty('--layout-gap', densityMap[layout.density].gap);
    root.style.setProperty('--container-width', layout.containerWidth);

    // Apply Mode
    const applyThemeMode = (mode: string) => {
      let activeMode = mode;
      if (mode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeMode = isDark ? 'dark' : 'light';
      }
      root.setAttribute('data-theme', activeMode);
      root.style.colorScheme = activeMode;
    };

    applyThemeMode(theme.mode);

    // Listen for system theme changes if in 'system' mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme.mode === 'system') applyThemeMode('system');
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
};
