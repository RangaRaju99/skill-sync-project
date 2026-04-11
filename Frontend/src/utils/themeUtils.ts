/**
 * Utility functions for theme management and color calculations.
 */

/**
 * Calculates whether black or white text should be used on a given background color.
 */
export const getContrastColor = (hex: string): string => {
  if (!hex || !hex.startsWith('#')) return 'inherit';
  
  // Remove hash if present
  const color = hex.replace('#', '');
  
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const r = parseInt(color.length === 3 ? color[0] + color[0] : color.substring(0, 2), 16);
  const g = parseInt(color.length === 3 ? color[1] + color[1] : color.substring(2, 4), 16);
  const b = parseInt(color.length === 3 ? color[2] + color[2] : color.substring(4, 6), 16);
  
  // YIQ formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f172a' : '#ffffff';
};

/**
 * Converts HEX to RGBA.
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Generate a smart palette based on a primary color.
 * (Simple implementation for now)
 */
export const generatePalette = (primary: string) => {
  return {
    primary,
    secondary: '#64748b', // Default secondary
    accent: '#f59e0b',    // Default accent
    background: '#ffffff',
    text: '#0f172a',
  };
};

/**
 * Theme Export/Import
 */
export const exportTheme = (theme: any) => {
  const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Checks if current time is "Night" (between 7 PM and 7 AM)
 */
export const isNightTime = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 7;
};
