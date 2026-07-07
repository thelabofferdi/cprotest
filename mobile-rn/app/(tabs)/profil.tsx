import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppHeader } from '../../src/shared/components/AppHeader';
import { ProfileLogo } from '../../src/shared/components/ProfileLogo';
import { ProfileLogoPicker } from '../../src/shared/components/ProfileLogoPicker';
import {
  ActionRow,
  InfoBanner,
  PageIntro,
  StitchCard,
} from '../../src/shared/components/StitchPrimitives';
import { useAuthStore } from '../../src/shared/hooks/useAuth';
import { useProfileStore } from '../../src/shared/hooks/useProfile';
import { useProfileConfigStore } from '../../src/shared/hooks/useProfileConfig';
import { getPilotageConfig } from '../../src/shared/utils/pilotage';
import { theme } from '../../src/theme';

function formatAccountLabel(email: string | null) {
  if (!email) return 'Compte C’PRO';
  if (!email.endsWith('@cpro.bj')) return email;

  const phone = email.replace('@cpro.bj', '');
  const match = phone.match(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return `+${phone}`;
  return `+${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
}

export default function ProfilScreen() {
  const email = useAuthStore(s => s.email);
  const signOut = useAuthStore(s => s.signOut);
  const profile = useProfileStore(s => s.profile);
  const config = useProfileConfigStore(s => s.config);
  const [logoPickerVisible, setLogoPickerVisible] = useState(false);
  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: config?.economicUnit,
  });

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader title="Profil" subtitle={config?.metier.nom ?? 'Activité'} showSettings={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageIntro
          eyebrow={config?.subscription.currentPlan.label ?? 'Compte'}
          title={profile?.nom ?? 'Profil C’PRO'}
          subtitle={formatAccountLabel(email)}
          icon="person-outline"
          color={pilotage.primaryColor}
        />

        <StitchCard style={styles.identityCard}>
          <TouchableOpacity accessibilityRole="button" activeOpacity={0.86} style={styles.logoButton} onPress={() => setLogoPickerVisible(true)}>
            <ProfileLogo profile={profile} size={60} color={pilotage.primaryColor} />
            <View style={[styles.logoBadge, { backgroundColor: pilotage.primaryColor }]}>
              <Ionicons name="camera-outline" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.identityCopy}>
            <Text style={styles.identityName}>{profile?.nom ?? 'Activité à configurer'}</Text>
            <Text style={styles.identityMeta}>{profile?.lieu ?? 'Localisation non renseignée'}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.editButton, { borderColor: `${pilotage.primaryColor}44` }]}
            onPress={() => router.push('/(onboarding)/profile-select')}
          >
            <Ionicons name="create-outline" size={18} color={pilotage.primaryColor} />
          </TouchableOpacity>
        </StitchCard>

        <InfoBanner
          icon="compass-outline"
          title={pilotage.unitLabel}
          text={pilotage.centralQuestion}
          color={pilotage.primaryColor}
        />

        <View style={styles.group}>
          <ActionRow
            icon="image-outline"
            title="Logo et identité"
            subtitle={profile?.logoUrl || profile?.photoUrl || profile?.logoPreset ? 'Identité visuelle personnalisée' : 'Ajouter un logo ou choisir un symbole'}
            color={pilotage.primaryColor}
            onPress={() => setLogoPickerVisible(true)}
          />
          <ActionRow
            icon="briefcase-outline"
            title="Mon activité"
            subtitle={config?.metier.nom ?? profile?.metier ?? 'Choisir une activité'}
            color={pilotage.primaryColor}
            onPress={() => router.push('/(onboarding)/profile-select')}
          />
          <ActionRow
            icon="ribbon-outline"
            title="Mode de pilotage"
            subtitle={config ? `${config.subscription.currentPlan.label} · ${pilotage.accountingLabel}` : 'Configuration en attente'}
            color={pilotage.primaryColor}
            onPress={() => router.push('/plans')}
          />
          <ActionRow
            icon="folder-outline"
            title="Documents"
            subtitle={config?.features.showDocumentsModule ? 'Exports et dossiers disponibles' : 'Selon le plan actif'}
            color={theme.colors.info}
            onPress={() => router.push('/(tabs)/documents')}
          />
          <ActionRow
            icon="school-outline"
            title="Académie"
            subtitle="Notions et fiches pratiques C’PRO"
            color={theme.colors.warning}
            onPress={() => router.push('/(tabs)/academie')}
          />
        </View>

        <View style={styles.group}>
          <ActionRow
            icon="cloud-done-outline"
            title="Sauvegarde"
            subtitle="Synchronisation automatique selon l’état réseau"
            color={theme.colors.success}
            trailing={<Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />}
          />
          <ActionRow
            icon="headset-outline"
            title="Support"
            subtitle="Assistance C’PRO"
            color={theme.colors.textSecondary}
            disabled
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProfileLogoPicker
        visible={logoPickerVisible}
        profile={profile}
        color={pilotage.primaryColor}
        onClose={() => setLogoPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { gap: theme.spacing.md, padding: theme.spacing.md, paddingBottom: 48 },
  identityCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  logoButton: {
    position: 'relative',
  },
  logoBadge: {
    alignItems: 'center',
    borderColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    bottom: -2,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 24,
  },
  identityCopy: { flex: 1 },
  identityName: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  identityMeta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  editButton: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  group: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  logoutText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: '900',
  },
});
