/**
 * Ridezon Design System
 * Premium startup UI inspired by Airbnb, Uber, Bolt
 */

import { Platform } from 'react-native';

export const theme = {
  // Color palette
  colors: {
    // Primary
    primary: '#00C46A',
    primaryDark: '#00A657',
    primaryLight: '#E6F9F1',
    
    // Neutrals
    black: '#050505',
    gray900: '#111827',
    gray700: '#374151',
    gray600: '#4B5563',
    gray500: '#6B7280',
    gray400: '#9CA3AF',
    gray300: '#D1D5DB',
    gray200: '#E5E7EB',
    gray100: '#F3F4F6',
    gray50: '#F9FAFB',
    white: '#FFFFFF',
    
    // Semantic
    success: '#00C46A',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    
    // Text
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.25)',
  },
  
  // Spacing scale (4px base)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    xxxxl: 48,
  },
  
  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  // Typography
  typography: {
    // Heading XL (screen titles)
    headingXL: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '600' as const,
      letterSpacing: -0.5,
    },
    // Heading L (section titles)
    headingL: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: -0.3,
    },
    // Heading M
    headingM: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
    },
    // Heading S
    headingS: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600' as const,
    },
    // Body L
    bodyL: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    // Body M (default)
    bodyM: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
    },
    // Body S
    bodyS: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    // Caption L
    captionL: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400' as const,
    },
    // Caption M
    captionM: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
    // Caption S
    captionS: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '400' as const,
    },
    // Button text
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
    },
  },
  
  // Shadows
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Icon sizes
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  
  // Button heights
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
    xl: 56,
  },
  
  // Input heights
  inputHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },
};

// Legacy exports for compatibility
export const Colors = {
  light: {
    text: theme.colors.textPrimary,
    background: theme.colors.background,
    tint: theme.colors.primary,
    icon: theme.colors.gray600,
    tabIconDefault: theme.colors.gray600,
    tabIconSelected: theme.colors.primary,
  },
  dark: {
    text: theme.colors.white,
    background: theme.colors.gray900,
    tint: theme.colors.primary,
    icon: theme.colors.gray400,
    tabIconDefault: theme.colors.gray400,
    tabIconSelected: theme.colors.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Type exports for TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;
