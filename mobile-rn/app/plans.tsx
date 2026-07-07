import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../src/shared/components/AppHeader';
import {
  EmptyState,
  InfoBanner,
  PageIntro,
  SectionHeader,
  StitchCard,
} from '../src/shared/components/StitchPrimitives';
import { useProfileConfigStore } from '../src/shared/hooks/useProfileConfig';
import { useProfileStore } from '../src/shared/hooks/useProfile';
import { api } from '../src/core/api/apiClient';
import { formatPlanPrice } from '../src/shared/utils/segmentation';
import { getPilotageConfig } from '../src/shared/utils/pilotage';
import { theme } from '../src/theme';
import type { PlanCode, ProfileDashboardConfig, SubscriptionPlan } from '../src/types';

const FEATURE_LABELS: Record<string, string> = {
  CARNET_SIMPLE: 'Carnet simple pour les gains, dépenses et suivis essentiels.',
  MODULES_STANDARD: 'Outils standards pour clients, stock, documents et suivi commercial.',
  MODULES_AVANCES_PLUS_EXPERT: 'Outils avancés, cycles, financement et assistance expert.',
  UPGRADE_DISPONIBLE: 'Évolutif si votre activité grandit ou se complexifie.',
  NON_RECOMMANDE: 'Non recommandé par la segmentation actuelle.',
};

function getPlanFeature(config: ProfileDashboardConfig | null, code: PlanCode) {
  const key = code.toLowerCase() as Lowercase<PlanCode>;
  const value = config?.planFeatures[key];
  return value ? FEATURE_LABELS[value] ?? value.replace(/_/g, ' ') : 'Configuration prête pour votre activité.';
}

export default function PlansScreen() {
  const config = useProfileConfigStore(s => s.config);
  const loadConfig = useProfileConfigStore(s => s.loadConfig);
  const profile = useProfileStore(s => s.profile);
  const [remotePlans, setRemotePlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: config?.economicUnit,
  });
  const plans = config?.subscription.allPlans?.length ? config.subscription.allPlans : remotePlans;
  const recommended = config?.recommendedPlan;
  const currentPlanCode = config?.subscription.currentPlan.code;

  useEffect(() => {
    if (!config) {
      loadConfig(profile?.metier).catch(() => undefined);
    }
  }, [config, loadConfig, profile?.metier]);

  useEffect(() => {
    if (config?.subscription.allPlans?.length) return;

    let mounted = true;
    setLoadingPlans(true);
    api.getSubscriptionPlans()
      .then(res => {
        if (mounted) setRemotePlans(res.data as SubscriptionPlan[]);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setLoadingPlans(false);
      });

    return () => {
      mounted = false;
    };
  }, [config?.subscription.allPlans]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    Alert.alert('Mode de pilotage', `Le mode "${plan.label}" sera activé depuis la gestion d’abonnement C’PRO.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader title="Modes" back showSettings={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageIntro
          eyebrow={config?.metier.nom ?? 'C’PRO'}
          title="Mode de pilotage"
          subtitle={pilotage.planPromise}
          icon="ribbon-outline"
          color={pilotage.primaryColor}
        />

        {config ? (
          <InfoBanner
            icon="compass-outline"
            title={pilotage.unitLabel}
            text={`Plan recommandé: ${config.subscription.currentPlan.label}. ${pilotage.centralQuestion}`}
            color={pilotage.primaryColor}
          />
        ) : (
          <InfoBanner
            icon="cloud-outline"
            title="Configuration en cours"
            text="Les plans seront adaptés dès que votre profil sera disponible."
            color={theme.colors.warning}
          />
        )}

        <SectionHeader title="Plans C’PRO" />

        {loadingPlans && plans.length === 0 ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={pilotage.primaryColor} />
            <Text style={styles.loadingText}>Chargement des plans...</Text>
          </View>
        ) : plans.length === 0 ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Plans indisponibles"
            text="Impossible d’afficher les plans pour le moment. Réessayez un peu plus tard."
            color={theme.colors.warning}
          />
        ) : (
          <View style={styles.planList}>
            {plans.map(plan => {
              const isRecommended = plan.code === recommended;
              const isCurrent = plan.code === currentPlanCode;
              const allowed = config?.allowedPlans.includes(plan.code) ?? true;

              return (
                <StitchCard
                  key={plan.code}
                  style={[
                    styles.planCard,
                    isRecommended ? { borderColor: pilotage.primaryColor, backgroundColor: `${pilotage.primaryColor}08` } : null,
                  ]}
                >
                  <View style={styles.planHeader}>
                    <View style={[styles.planIcon, { backgroundColor: `${pilotage.primaryColor}18` }]}> 
                      <Ionicons name={isRecommended ? 'star' : 'layers-outline'} size={20} color={pilotage.primaryColor} />
                    </View>
                    <View style={styles.planCopy}>
                      <View style={styles.planTitleRow}>
                        <Text style={styles.planTitle}>{plan.label}</Text>
                        {isRecommended ? <Text style={[styles.badge, { color: pilotage.primaryColor }]}>Recommandé</Text> : null}
                      </View>
                      <Text style={styles.planPromise}>{plan.promise}</Text>
                    </View>
                  </View>

                  <View style={styles.planMetaRow}>
                    <View>
                      <Text style={styles.metaLabel}>Tarif</Text>
                      <Text style={styles.metaValue}>{formatPlanPrice(plan)}</Text>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaRight}>
                      <Text style={styles.metaLabel}>Statut</Text>
                      <Text style={[styles.metaValue, { color: isCurrent ? theme.colors.success : theme.colors.text }]}> 
                        {isCurrent ? 'Actuel' : allowed ? 'Disponible' : 'Non recommandé'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureRow}>
                    <Ionicons name={allowed ? 'checkmark-circle' : 'alert-circle-outline'} size={18} color={allowed ? theme.colors.success : theme.colors.textLight} />
                    <Text style={styles.featureText}>{getPlanFeature(config, plan.code)}</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={isCurrent || !allowed}
                    onPress={() => handleSelectPlan(plan)}
                    style={[
                      styles.actionButton,
                      isRecommended ? { backgroundColor: pilotage.primaryColor, borderColor: pilotage.primaryColor } : { borderColor: pilotage.primaryColor },
                      (isCurrent || !allowed) ? styles.actionButtonDisabled : null,
                    ]}
                  >
                    <Text style={[styles.actionButtonText, isRecommended ? styles.actionButtonTextPrimary : { color: pilotage.primaryColor }]}> 
                      {isCurrent ? 'Plan actuel' : allowed ? 'Choisir ce mode' : 'Indisponible'}
                    </Text>
                  </TouchableOpacity>
                </StitchCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { gap: theme.spacing.md, padding: theme.spacing.md, paddingBottom: 48 },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  loadingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  planList: { gap: theme.spacing.md },
  planCard: { gap: theme.spacing.md },
  planHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  planIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  planCopy: { flex: 1 },
  planTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  planTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  badge: {
    ...theme.typography.caption,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  planPromise: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  planMetaRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLow,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  metaDivider: {
    backgroundColor: theme.colors.border,
    height: 34,
    width: 1,
  },
  metaRight: { flex: 1 },
  metaLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  metaValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
    marginTop: 2,
  },
  featureRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  featureText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
  },
  actionButtonDisabled: { opacity: 0.5 },
  actionButtonText: {
    ...theme.typography.caption,
    fontWeight: '900',
  },
  actionButtonTextPrimary: { color: '#FFFFFF' },
});
