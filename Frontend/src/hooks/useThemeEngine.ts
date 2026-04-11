import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getContrastColor, hexToRgba } from '../utils/themeUtils';

export const useThemeEngine = () => {
  const theme = useSelector((state: RootState) => state.theme.present);

  useEffect(() => {
    const root = document.documentElement;
    const { colors, typography, components, layout } = theme;

    // --- Colors ---
    Object.entries(colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${key}`, value);
      }
    });

    // Auto-contrast for text on surface/background if not explicitly set
    root.style.setProperty('--on-background', getContrastColor(colors.background));
    root.style.setProperty('--on-surface', getContrastColor(colors.surface));
    root.style.setProperty('--on-primary', getContrastColor(colors.primary));

    // RGB versions for opacity use
    const hexToRgbValues = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };

    root.style.setProperty('--primary-rgb', hexToRgbValues(colors.primary));
    root.style.setProperty('--background-rgb', hexToRgbValues(colors.background));

    // --- Typography ---
    root.style.setProperty('--font-family', typography.fontFamily);
    root.style.setProperty('--heading-font-family', typography.headingFontFamily);
    root.style.setProperty('--base-font-size', `${typography.baseFontSize}px`);

    // --- Components ---
    root.style.setProperty('--button-radius', components.buttonRadius);
    root.style.setProperty('--card-radius', components.cardRadius);
    root.style.setProperty('--card-shadow', components.cardShadow);
    root.style.setProperty('--input-radius', components.inputRadius);
    
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
