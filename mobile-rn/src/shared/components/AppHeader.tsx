import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  showSettings?: boolean;
  style?: ViewStyle;
}

export function AppHeader({
  title = "C'PRO",
  subtitle,
  back = false,
  onBack,
  showSettings = true,
  style,
}: AppHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  if (back) {
    return (
      <View style={[styles.container, styles.backContainer, style]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={styles.iconButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={21} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.centerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {showSettings && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Paramètres"
          style={styles.iconButton}
          onPress={() => router.push('/account')}
        >
          <Ionicons name="settings-outline" size={21} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  backContainer: {
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  centerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerSpacer: {
    height: 44,
    width: 44,
  },
});
