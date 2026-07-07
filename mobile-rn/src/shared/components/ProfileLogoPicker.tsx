import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../core/api/apiClient';
import { useProfileStore } from '../hooks/useProfile';
import { theme } from '../../theme';
import type { UserProfile } from '../../types';
import { LOGO_PRESETS, ProfileLogo } from './ProfileLogo';

type PickedAsset = ImagePicker.ImagePickerAsset;

function getFileExtension(uri: string) {
  const clean = uri.split('?')[0] ?? uri;
  const ext = clean.split('.').pop()?.toLowerCase();
  return ext && ext.length <= 5 ? ext : 'jpg';
}

function getMimeType(asset: PickedAsset) {
  if (asset.mimeType) return asset.mimeType;
  const ext = getFileExtension(asset.uri);
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function persistImageLocally(uri: string, userId: string) {
  if (!FileSystem.documentDirectory) return uri;

  try {
    const directory = `${FileSystem.documentDirectory}profile-logos/`;
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    const destination = `${directory}${userId}-${Date.now()}.${getFileExtension(uri)}`;
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  } catch {
    return uri;
  }
}

async function uploadLogo(asset: PickedAsset, userId: string) {
  const formData = new FormData();
  const extension = getFileExtension(asset.uri);
  const name = asset.fileName ?? `logo-${userId}.${extension}`;

  formData.append('file', {
    uri: asset.uri,
    name,
    type: getMimeType(asset),
  } as unknown as Blob);

  const res = await api.uploadLogo(formData);
  const data = res.data as { url?: string };
  return data.url ?? null;
}

export function ProfileLogoPicker({
  visible,
  profile,
  color = theme.colors.primary,
  onClose,
}: {
  visible: boolean;
  profile: UserProfile | null;
  color?: string;
  onClose: () => void;
}) {
  const updateIdentity = useProfileStore(s => s.updateIdentity);
  const [saving, setSaving] = useState(false);

  const handlePreset = async (presetId: string) => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateIdentity({ logoPreset: presetId, logoUrl: null, photoUrl: null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    if (!profile) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Accès nécessaire', 'Autorisez l’accès à vos images pour choisir un logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.86,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setSaving(true);
    try {
      const localUri = await persistImageLocally(asset.uri, profile.userId);
      let nextLogoUrl = localUri;

      try {
        nextLogoUrl = await uploadLogo(asset, profile.userId) ?? localUri;
      } catch {
        nextLogoUrl = localUri;
      }

      await updateIdentity({ logoUrl: nextLogoUrl, logoPreset: null, photoUrl: null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateIdentity({ logoUrl: null, photoUrl: null, logoPreset: null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ProfileLogo profile={profile} size={52} color={color} />
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Identité visuelle</Text>
                <Text style={styles.subtitle}>{profile?.nom ?? 'Profil C’PRO'}</Text>
              </View>
            </View>
            <TouchableOpacity accessibilityRole="button" style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.86} disabled={saving} style={[styles.importButton, { backgroundColor: color }]} onPress={handleImport}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="image-outline" size={19} color="#FFFFFF" />}
            <Text style={styles.importText}>{saving ? 'Mise à jour...' : 'Importer un logo'}</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Logos rapides</Text>
          <ScrollView contentContainerStyle={styles.presetsGrid} showsVerticalScrollIndicator={false}>
            {LOGO_PRESETS.map(preset => {
              const selected = profile?.logoPreset === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  activeOpacity={0.86}
                  disabled={saving}
                  style={[styles.presetButton, selected && { borderColor: preset.color, backgroundColor: `${preset.color}10` }]}
                  onPress={() => handlePreset(preset.id)}
                >
                  <View style={[styles.presetIcon, { backgroundColor: preset.backgroundColor }]}>
                    <Ionicons name={preset.icon} size={22} color={preset.color} />
                  </View>
                  <Text style={styles.presetLabel}>{preset.label}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={17} color={preset.color} /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {(profile?.logoUrl || profile?.photoUrl || profile?.logoPreset) ? (
            <TouchableOpacity activeOpacity={0.86} disabled={saving} style={styles.removeButton} onPress={handleRemove}>
              <Ionicons name="trash-outline" size={17} color={theme.colors.error} />
              <Text style={styles.removeText}>Retirer l’identité visuelle</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    gap: theme.spacing.md,
    maxHeight: '86%',
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  title: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  importButton: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  importText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  presetButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLow,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    flexBasis: '31.5%',
    gap: theme.spacing.xs,
    minHeight: 92,
    padding: theme.spacing.sm,
  },
  presetIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  presetLabel: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  removeButton: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 44,
  },
  removeText: {
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: '800',
  },
});
