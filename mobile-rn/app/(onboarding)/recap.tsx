import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import ProgressHeader from '../../src/shared/components/ProgressHeader';
import {
  InfoBanner,
  PageIntro,
  SectionHeader,
  StitchCard,
} from '../../src/shared/components/StitchPrimitives';
import { useAuthStore } from '../../src/shared/hooks/useAuth';
import { useProfileStore } from '../../src/shared/hooks/useProfile';
import { useProfileConfigStore } from '../../src/shared/hooks/useProfileConfig';
import { api } from '../../src/core/api/apiClient';
import { getFallbackDashboardConfig } from '../../src/shared/utils/segmentation';
import { getPilotageConfig } from '../../src/shared/utils/pilotage';
import { theme } from '../../src/theme';
import type { Metier, ProfileDashboardConfig, UserProfile } from '../../src/types';

function isDashboardConfig(data: unknown): data is ProfileDashboardConfig {
  return Boolean(
    data &&
    typeof data === 'object' &&
    'economicUnit' in data &&
    'subscription' in data &&
    'metier' in data,
  );
}

export default function RecapScreen() {
  const { metierSlug, metierLabel, location, structureName, statut } = useLocalSearchParams<{
    metierSlug: string;
    metierLabel: string;
    location: string;
    structureName: string;
    statut: string;
  }>();

  const userId = useAuthStore(s => s.userId);
  const saveProfile = useProfileStore(s => s.saveProfile);
  const loadConfig = useProfileConfigStore(s => s.loadConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<ProfileDashboardConfig>(() =>
    getFallbackDashboardConfig(metierSlug),
  );
  const [source, setSource] = useState<'synced' | 'fallback'>('fallback');

  const hasRequiredParams = Boolean(metierSlug && metierLabel && location && structureName && statut);
  const pilotage = getPilotageConfig({ metier: metierSlug, economicUnit: dashboardConfig.economicUnit });

  const rows = useMemo(() => [
    { icon: 'briefcase-outline' as const, label: 'Activité', value: metierLabel || 'Non renseignée' },
    { icon: 'storefront-outline' as const, label: 'Structure', value: structureName || 'Non renseignée' },
    { icon: 'location-outline' as const, label: 'Localisation', value: location || 'Non renseignée' },
    { icon: 'shield-checkmark-outline' as const, label: 'Statut', value: statut || 'Non renseigné' },
  ], [location, metierLabel, statut, structureName]);

  useEffect(() => {
    if (!metierSlug) return;

    let mounted = true;
    setDashboardConfig(getFallbackDashboardConfig(metierSlug));
    setSource('fallback');

    api.getMetierDashboardConfig(metierSlug)
      .then(res => {
        if (mounted && isDashboardConfig(res.data)) {
          setDashboardConfig(res.data);
          setSource('synced');
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [metierSlug]);

  const handleFinalize = async () => {
    if (!userId) {
      setError('Session utilisateur introuvable. Veuillez vous reconnecter.');
      return;
    }

    if (!hasRequiredParams) {
      setError('Informations d’activité incomplètes. Revenez à l’étape précédente pour vérifier le formulaire.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const profile: UserProfile = {
        userId,
        nom: structureName,
        metier: metierSlug as Metier,
        lieu: location,
        capitalDepart: 0,
        modeFinancement: 'fonds_propres',
        devise: 'XOF',
        createdAt: new Date().toISOString(),
      };

      await saveProfile(profile);
      await loadConfig(profile.metier);
      router.replace('/(tabs)/dashboard');
    } catch {
      setError('Impossible de finaliser l’inscription. Veuillez vérifier votre connexion.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressHeader currentStep={5} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageIntro
          eyebrow="Dernière étape"
          title="Confirmez votre espace"
          subtitle={pilotage.planPromise}
          icon="checkmark-circle-outline"
          color={pilotage.primaryColor}
        />

        {error ? (
          <InfoBanner icon="alert-circle-outline" title="À vérifier" text={error} color={theme.colors.error} />
        ) : null}

        <InfoBanner
          icon={source === 'synced' ? 'cloud-done-outline' : 'cloud-offline-outline'}
          title={source === 'synced' ? 'Configuration prête' : 'Configuration provisoire'}
          text={`${dashboardConfig.metier.nom} · ${dashboardConfig.subscription.currentPlan.label}.`}
          color={source === 'synced' ? theme.colors.success : theme.colors.warning}
        />

        <SectionHeader title="Récapitulatif" />
        <View style={styles.rowList}>
          {rows.map(row => (
            <StitchCard key={row.label} style={styles.recapRow}>
              <View style={[styles.rowIcon, { backgroundColor: `${pilotage.primaryColor}18` }]}>
                <Ionicons name={row.icon} size={18} color={pilotage.primaryColor} />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
            </StitchCard>
          ))}
        </View>

        <SectionHeader title="Mode actif" />
        <StitchCard style={styles.modeCard}>
          <Text style={styles.modeEmoji}>{pilotage.icon}</Text>
          <View style={styles.modeCopy}>
            <Text style={[styles.modeLabel, { color: pilotage.primaryColor }]}>{pilotage.unitLabel}</Text>
            <Text style={styles.modeText}>{pilotage.centralQuestion}</Text>
          </View>
        </StitchCard>

        <TouchableOpacity
          activeOpacity={0.88}
          disabled={saving}
          style={[styles.primaryButton, { backgroundColor: pilotage.primaryColor }, saving && styles.disabled]}
          onPress={handleFinalize}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="rocket-outline" size={18} color="#FFFFFF" />}
          <Text style={styles.primaryButtonText}>{saving ? 'Création...' : 'Créer mon espace'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    flex: 1,
  },
  scroll: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 32,
  },
  rowList: {
    gap: theme.spacing.sm,
  },
  recapRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rowValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
    marginTop: 2,
  },
  modeCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modeEmoji: {
    fontSize: 34,
  },
  modeCopy: {
    flex: 1,
  },
  modeLabel: {
    ...theme.typography.h4,
  },
  modeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginTop: 3,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    height: 52,
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.72,
  },
});
