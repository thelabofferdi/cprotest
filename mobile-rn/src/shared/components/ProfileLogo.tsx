import React from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ENV } from '../../core/api/env';
import { theme } from '../../theme';
import type { UserProfile } from '../../types';

export interface LogoPreset {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}

export const LOGO_PRESETS: LogoPreset[] = [
  { id: 'commerce', label: 'Boutique', icon: 'storefront-outline', color: '#2563EB', backgroundColor: '#EAF1FF' },
  { id: 'vente', label: 'Vente', icon: 'bag-handle-outline', color: '#3F51B5', backgroundColor: '#EEF2FF' },
  { id: 'resto', label: 'Cuisine', icon: 'restaurant-outline', color: '#F59E0B', backgroundColor: '#FFF7E6' },
  { id: 'agri', label: 'Culture', icon: 'leaf-outline', color: '#2E7D32', backgroundColor: '#E8F5E9' },
  { id: 'atelier', label: 'Atelier', icon: 'construct-outline', color: '#7C3AED', backgroundColor: '#F3E8FF' },
  { id: 'stock', label: 'Stock', icon: 'cube-outline', color: '#0F766E', backgroundColor: '#E6FFFB' },
];

type LogoProfile = Pick<UserProfile, 'nom' | 'photoUrl' | 'logoUrl' | 'logoPreset'>;

export function getInitials(name?: string | null) {
  if (!name) return 'CP';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'CP';
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return null;
  if (/^(https?:|file:|content:|data:|blob:)/.test(url)) return url;

  const base = ENV.API_BASE_URL.replace(/\/$/, '');
  return `${base}/${url.replace(/^\//, '')}`;
}

export function getLogoPreset(id?: string | null) {
  return LOGO_PRESETS.find(preset => preset.id === id) ?? null;
}

export function ProfileLogo({
  profile,
  size = 58,
  color = theme.colors.primary,
  style,
}: {
  profile?: LogoProfile | null;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const imageUri = resolveMediaUrl(profile?.logoUrl ?? profile?.photoUrl);
  const preset = getLogoPreset(profile?.logoPreset);
  const radius = Math.max(12, Math.round(size * 0.32));

  if (imageUri) {
    return (
      <View style={[styles.logoBase, { height: size, width: size, borderRadius: radius }, style]}>
        <Image source={{ uri: imageUri }} style={[styles.image, { borderRadius: radius }]} resizeMode="cover" />
      </View>
    );
  }

  if (preset) {
    return (
      <View style={[styles.logoBase, { backgroundColor: preset.backgroundColor, height: size, width: size, borderRadius: radius }, style]}>
        <Ionicons name={preset.icon} size={Math.round(size * 0.48)} color={preset.color} />
      </View>
    );
  }

  return (
    <View style={[styles.logoBase, { backgroundColor: `${color}18`, height: size, width: size, borderRadius: radius }, style]}>
      <Text style={[styles.initials, { color, fontSize: Math.max(13, Math.round(size * 0.32)) }]}>{getInitials(profile?.nom)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoBase: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  initials: {
    fontWeight: '900',
  },
});
