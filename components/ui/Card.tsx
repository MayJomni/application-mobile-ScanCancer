import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, Shadow, Spacing } from '@/constants/Theme';
import { useThemeColors } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const colors = useThemeColors();
  const paddingMap = { sm: Spacing.sm, md: Spacing.md, lg: Spacing.lg };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          padding: paddingMap[padding],
        },
        variant === 'elevated' && Shadow.md,
        variant === 'outlined' && {
          borderWidth: 1,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
