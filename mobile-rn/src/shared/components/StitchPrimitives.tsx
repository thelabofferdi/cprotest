import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export function StitchCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PageIntro({
  eyebrow,
  title,
  subtitle,
  icon,
  color = theme.colors.primary,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}) {
  return (
    <View style={styles.pageIntro}>
      <View style={styles.pageIntroCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color }]}>{eyebrow}</Text> : null}
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {icon ? (
        <View style={[styles.pageIcon, { backgroundColor: `${color}18` }]}> 
          <Ionicons name={icon} size={24} color={color} />
        </View>
      ) : null}
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity accessibilityRole="button" onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function InfoBanner({
  icon = 'information-circle-outline',
  title,
  text,
  color = theme.colors.primary,
  style,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  text: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.infoBanner, { borderColor: `${color}22` }, style]}>
      <View style={[styles.infoIcon, { backgroundColor: `${color}18` }]}> 
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.infoCopy}>
        {title ? <Text style={styles.infoTitle}>{title}</Text> : null}
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

export function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  color = theme.colors.primary,
  trailing,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  trailing?: React.ReactNode;
  disabled?: boolean;
}) {
  const content = (
    <>
      <View style={[styles.actionIcon, { backgroundColor: `${color}18` }]}> 
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.actionSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />}
    </>
  );

  if (!onPress) {
    return <View style={[styles.actionRow, disabled && styles.disabled]}>{content}</View>;
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[styles.actionRow, disabled && styles.disabled]}
    >
      {content}
    </TouchableOpacity>
  );
}

export function EmptyState({
  icon = 'information-circle-outline',
  title,
  text,
  color = theme.colors.primary,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  color?: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: `${color}18` }]}> 
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function IconBubble({
  name,
  tone = 'primary',
  size = 40,
}: {
  name: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'secondary' | 'error' | 'muted';
  size?: number;
}) {
  const palette = {
    primary: { backgroundColor: theme.colors.successLight, color: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.warningLight, color: theme.colors.secondary },
    error: { backgroundColor: theme.colors.errorLight, color: theme.colors.error },
    muted: { backgroundColor: theme.colors.surfaceContainerHigh, color: theme.colors.textSecondary },
  }[tone];

  return (
    <View style={[styles.iconBubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.backgroundColor }]}>
      <Ionicons name={name} size={Math.round(size * 0.52)} color={palette.color} />
    </View>
  );
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Amount({
  value,
  color = theme.colors.text,
  size = 'md',
  style,
}: {
  value: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.amount, styles[`amount_${size}`], { color }, style]}>{value}</Text>;
}

export function Chip({
  children,
  active,
  style,
}: {
  children: React.ReactNode;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.chip, active && styles.chipActive, style]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  pageIntro: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  pageIntroCopy: {
    flex: 1,
  },
  eyebrow: {
    ...theme.typography.label,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  pageTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  pageSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  pageIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.xxl,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  sectionAction: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  infoBanner: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  infoIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '800',
    marginBottom: 2,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  actionRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 68,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  actionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  disabled: {
    opacity: 0.55,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  emptyIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.xxl,
    height: 48,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    width: 48,
  },
  emptyTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  iconBubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  amount: {
    fontWeight: '800',
  },
  amount_sm: {
    fontSize: 16,
    lineHeight: 22,
  },
  amount_md: {
    ...theme.typography.currency,
  },
  amount_lg: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
  },
  chip: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.borderRadius.full,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
