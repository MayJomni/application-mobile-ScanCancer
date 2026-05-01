/**
 * DermaScan Design System — Color Palette
 * Medical-grade color scheme with accessibility in mind
 */

// Primary brand colors
const primary = '#2563EB';      // Medical Blue
const primaryLight = '#3B82F6';
const primaryDark = '#1D4ED8';

// Secondary
const secondary = '#0D9488';    // Teal / Health
const secondaryLight = '#14B8A6';
const secondaryDark = '#0F766E';

// Accent
const accent = '#7C3AED';       // Soft Purple
const accentLight = '#8B5CF6';

// Risk levels
const danger = '#DC2626';       // Malignant
const dangerLight = '#FEE2E2';
const warning = '#F59E0B';      // Pre-malignant
const warningLight = '#FEF3C7';
const success = '#16A34A';      // Benign
const successLight = '#DCFCE7';

export default {
  primary,
  primaryLight,
  primaryDark,
  secondary,
  secondaryLight,
  secondaryDark,
  accent,
  accentLight,
  danger,
  dangerLight,
  warning,
  warningLight,
  success,
  successLight,
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    background: '#F8FAFC',
    backgroundSecondary: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    tint: primary,
    tabIconDefault: '#94A3B8',
    tabIconSelected: primary,
    separator: '#E2E8F0',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    card: '#1E293B',
    cardBorder: '#334155',
    tint: primaryLight,
    tabIconDefault: '#64748B',
    tabIconSelected: primaryLight,
    separator: '#334155',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};
