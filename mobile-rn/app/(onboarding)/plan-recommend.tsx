import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import ProgressHeader from '../../src/shared/components/ProgressHeader';
import {
  InfoBanner,
  PageIntro,
  SectionHeader,
  StitchCard,
} from '../../src/shared/components/StitchPrimitives';
import { api } from '../../src/core/api/apiClient';
import { formatPlanPrice, getFallbackDashboardConfig } from '../../src/shared/utils/segmentation';
import { getPilotageConfig } from '../../src/shared/utils/pilotage';
import { theme } from '../../src/theme';
import type { ProfileDashboardConfig } from '../../src/types';

function isDashboardConfig(data: unknown): data is ProfileDashboardConfig {
  return Boolean(
    data &&
    typeof data === 'object' &&
    'economicUnit' in data &&
    'subscription' in data &&
    'metier' in data,
  );
}

function getAccessLabel(value: string) {
  if (value === 'REQUIRED') return 'Essentiel';
  if (value === 'STRONG') return 'Fortement utile';
  if (value === 'CONTEXTUAL') return 'Contextuel';
  return 'Simple';
}

export default function PlanRecommendScreen() {
  const { metier } = useLocalSearchParams<{ metier: string }>();
  const [dashboardConfig, setDashboardConfig] = useState<ProfileDashboardConfig>(() =>
    getFallbackDashboardConfig(metier),
  );
  const [source, setSource] = useState<'synced' | 'fallback'>('fallback');

  const pilotage = getPilotageConfig({ metier, economicUnit: dashboardConfig.economicUnit });
  const subscriptionPlan = dashboardConfig.subscription.currentPlan;
  const optionRows = useMemo(() => [
    {
      icon: 'book-outline' as const,
      title: pilotage.accountingLabel,
      text: getAccessLabel(dashboardConfig.options.accountingFiscality),
    },
    {
      icon: 'analytics-outline' as const,
      title: pilotage.analyseLabel,
      text: getAccessLabel(dashboardConfig.options.financialPlanning),
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Expert contextuel',
      text: getAccessLabel(dashboardConfig.options.expertAssistance),
    },
  ], [dashboardConfig.options, pilotage.accountingLabel, pilotage.analyseLabel]);

  useEffect(() => {
    let mounted = true;
    const fallback = getFallbackDashboardConfig(metier);
    setDashboardConfig(fallback);
    setSource('fallback');

    if (metier) {
      api.getMetierDashboardConfig(metier)
        .then(res => {
          if (mounted && isDashboardConfig(res.data)) {
            setDashboardConfig(res.data);
            setSource('synced');
          }
        })
        .catch(() => undefined);
    }

    return () => {
      mounted = false;
    };
  }, [metier]);

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/workspace-setup',
      params: { metier },
    });
  };

  return (
    <View style={styles.container}>
      <ProgressHeader currentStep={4} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageIntro
          eyebrow={dashboardConfig.metier.nom}
          title="Votre mode de pilotage"
          subtitle={pilotage.planPromise}
          icon="options-outline"
          color={pilotage.primaryColor}
        />

        <StitchCard style={[styles.modeCard, { borderColor: `${pilotage.primaryColor}55` }]}>
          <View style={[styles.modeIcon, { backgroundColor: `${pilotage.primaryColor}18` }]}>
            <Text style={styles.modeEmoji}>{pilotage.icon}</Text>
          </View>
          <View style={styles.modeCopy}>
            <Text style={[styles.modeLabel, { color: pilotage.primaryColor }]}>Unité économique</Text>
            <Text style={styles.modeTitle}>{pilotage.unitLabel}</Text>
            <Text style={styles.modeQuestion}>{pilotage.centralQuestion}</Text>
          </View>
        </StitchCard>

        <InfoBanner
          icon={source === 'synced' ? 'checkmark-circle-outline' : 'cloud-offline-outline'}
          title={source === 'synced' ? 'Configuration prête' : 'Configuration provisoire'}
          text={source === 'synced'
            ? 'Votre mode de pilotage et votre plan sont prêts.'
            : 'Vous pouvez continuer; la mise à jour affinera les détails ensuite.'}
          color={source === 'synced' ? theme.colors.success : theme.colors.warning}
        />

        <SectionHeader title="Ce que C’PRO active" />
        <View style={styles.optionsList}>
          {optionRows.map(row => (
            <StitchCard key={row.title} style={styles.optionRow}>
              <View style={[styles.optionIcon, { backgroundColor: `${pilotage.primaryColor}18` }]}>
                <Ionicons name={row.icon} size={18} color={pilotage.primaryColor} />
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{row.title}</Text>
                <Text style={styles.optionText}>{row.text}</Text>
              </View>
            </StitchCard>
          ))}
        </View>

        <SectionHeader title="Plan associé" />
        <StitchCard style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planLabel}>Recommandé pour ce pilotage</Text>
              <Text style={styles.planName}>{subscriptionPlan.label}</Text>
            </View>
            <View style={[styles.planBadge, { backgroundColor: `${pilotage.primaryColor}16` }]}>
              <Text style={[styles.planBadgeText, { color: pilotage.primaryColor }]}>{dashboardConfig.recommendedPlan}</Text>
            </View>
          </View>
          <Text style={styles.planPromise}>{subscriptionPlan.promise}</Text>
          <Text style={styles.planPrice}>{formatPlanPrice(subscriptionPlan)}</Text>
        </StitchCard>

        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.primaryButton, { backgroundColor: pilotage.primaryColor }]}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>{pilotage.primaryCta}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  modeCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modeIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  modeEmoji: {
    fontSize: 26,
  },
  modeCopy: {
    flex: 1,
  },
  modeLabel: {
    ...theme.typography.label,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  modeTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  modeQuestion: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  optionsList: {
    gap: theme.spacing.sm,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  optionIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  optionText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planCard: {
    gap: theme.spacing.sm,
  },
  planHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  planLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  planName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: 3,
  },
  planBadge: {
    borderRadius: 8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  planPromise: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  planPrice: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    fontWeight: '800',
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
});
