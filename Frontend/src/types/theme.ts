export type ColorMode = 'light' | 'dark' | 'system';
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  gradient?: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number; // in px
}

export interface ThemeComponentStyles {
  buttonRadius: string;
  cardRadius: string;
  cardShadow: string;
  inputRadius: string;
  glassmorphism: boolean;
  animationSpeed: number; // 0.5 (fast), 1 (normal), 1.5 (slow)
}

export interface ThemeLayout {
  density: LayoutDensity;
  containerWidth: string;
}

export interface AppTheme {
  id: string;
  name: string;
  mode: ColorMode;
  colors: ThemeColors;
  typography: ThemeTypography;
  components: ThemeComponentStyles;
  layout: ThemeLayout;
}

export interface ThemeHistory {
  past: AppTheme[];
  present: AppTheme;
  future: AppTheme[];
}
