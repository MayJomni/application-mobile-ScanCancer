import { useColorScheme as _useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

/**
 * Enhanced hook that returns the current theme colors
 */
export function useThemeColors() {
  const colorScheme = _useColorScheme() ?? 'light';
  return Colors[colorScheme];
}

export function useColorScheme() {
  return _useColorScheme() ?? 'light';
}
