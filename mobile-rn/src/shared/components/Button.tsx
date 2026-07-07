import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { theme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style, textStyle }: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: theme.colors.primary },
      text: { color: '#FFFFFF' },
    },
    secondary: {
      container: { backgroundColor: theme.colors.secondary },
      text: { color: '#FFFFFF' },
    },
    outline: {
      container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary },
      text: { color: theme.colors.primary },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: theme.colors.primary },
    },
    danger: {
      container: { backgroundColor: theme.colors.error },
      text: { color: '#FFFFFF' },
    },
  };
  const current = variantStyles[variant];
  const iconColor = current.text.color as string;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.container, current.container, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={iconColor} />}
          <Text style={[styles.text, current.text, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  text: {
    ...theme.typography.label,
    textTransform: 'none',
  },
  disabled: {
    opacity: 0.5,
  },
});
