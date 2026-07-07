import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/shared/components/AppHeader';
import {
  Amount,
  EmptyState,
  InfoBanner,
  PageIntro,
  SectionHeader,
  StitchCard,
} from '../../src/shared/components/StitchPrimitives';
import { useProfileConfigStore } from '../../src/shared/hooks/useProfileConfig';
import { useProfileStore } from '../../src/shared/hooks/useProfile';
import { useTransactionStore } from '../../src/shared/hooks/useTransactions';
import { formatFCFA } from '../../src/shared/utils/financial';
import { getPilotageConfig, getPlanningProgress } from '../../src/shared/utils/pilotage';
import { api } from '../../src/core/api/apiClient';
import { theme } from '../../src/theme';

interface InsightItem {
  title: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function AnalyseScreen() {
  const profileConfig = useProfileConfigStore(s => s.config);
  const profile = useProfileStore(s => s.profile);
  const transactions = useTransactionStore(s => s.transactions);
  const [submittingExpert, setSubmittingExpert] = useState(false);

  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: profileConfig?.economicUnit,
  });
  const planningProgress = getPlanningProgress(transactions, pilotage);

  const monthlyTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      const date = new Date(tx.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  const monthlyRecettes = useMemo(
    () => monthlyTransactions.filter(tx => tx.type === 'recette').reduce((sum, tx) => sum + tx.montant, 0),
    [monthlyTransactions],
  );
  const monthlyDepenses = useMemo(
    () => monthlyTransactions.filter(tx => tx.type === 'depense').reduce((sum, tx) => sum + tx.montant, 0),
    [monthlyTransactions],
  );
  const monthlyResult = monthlyRecettes - monthlyDepenses;
  const marginRate = monthlyRecettes > 0 ? (monthlyResult / monthlyRecettes) * 100 : 0;

  const insights = useMemo<InsightItem[]>(() => {
    if (monthlyTransactions.length === 0) {
      return [
        {
          title: 'Données à saisir',
          text: `Ajoutez vos premières opérations pour alimenter ${pilotage.analyseLabel.toLowerCase()} avec des chiffres réels.`,
          icon: 'create-outline',
          color: pilotage.primaryColor,
        },
      ];
    }

    const items: InsightItem[] = [
      {
        title: 'Résultat net',
        text: monthlyResult >= 0
          ? `Le mois est positif de ${formatFCFA(monthlyResult)}.`
          : `Les dépenses dépassent les recettes de ${formatFCFA(Math.abs(monthlyResult))}.`,
        icon: monthlyResult >= 0 ? 'trending-up-outline' : 'warning-outline',
        color: monthlyResult >= 0 ? theme.colors.success : theme.colors.error,
      },
      {
        title: 'Poids des charges',
        text: monthlyRecettes > 0
          ? `Les charges représentent ${formatPercent((monthlyDepenses / monthlyRecettes) * 100)} des recettes enregistrées.`
          : 'Ajoutez une recette pour comparer les charges à l’activité.',
        icon: 'swap-horizontal-outline',
        color: theme.colors.warning,
      },
    ];

    if (profileConfig?.features.showFinancialPlanning) {
      items.push({
        title: 'Pilotage actif',
        text: `${profileConfig.metier.nom} utilise des seuils adaptés à votre activité C’PRO.`,
        icon: 'analytics-outline',
        color: pilotage.primaryColor,
      });
    }

    return items;
  }, [monthlyDepenses, monthlyRecettes, monthlyResult, monthlyTransactions.length, pilotage.analyseLabel, pilotage.primaryColor, profileConfig]);

  const handleExpertRequest = async () => {
    if (!profileConfig) return;

    setSubmittingExpert(true);
    try {
      await api.createExpertRequest({
        reason: profileConfig.expertTriggers[0] ?? 'demande-conseil',
        details: `Demande depuis ${pilotage.analyseLabel} - plan ${profileConfig.recommendedPlan}`,
        context: {
          metier: profileConfig.metier.slug,
          plan: profileConfig.recommendedPlan,
          options: profileConfig.options,
          triggers: profileConfig.expertTriggers,
        },
      });
      Alert.alert('Demande envoyée', 'Un expert C’PRO a bien reçu votre demande et étudiera votre dossier.');
    } catch {
      Alert.alert('Demande non envoyée', 'Veuillez vérifier votre connexion Internet.');
    } finally {
      setSubmittingExpert(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader title={pilotage.analyseLabel} subtitle={pilotage.unitLabel} showSettings={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageIntro
          eyebrow={profileConfig?.subscription.currentPlan.label ?? 'Analyse'}
          title={pilotage.dashboardTitle}
          subtitle={pilotage.centralQuestion}
          icon="analytics-outline"
          color={pilotage.primaryColor}
        />

        {!planningProgress.unlocked ? (
          <>
            <StitchCard style={styles.lockCard}>
              <View style={[styles.lockIcon, { backgroundColor: `${pilotage.primaryColor}18` }]}>
                <Ionicons name="lock-closed-outline" size={22} color={pilotage.primaryColor} />
              </View>
              <Text style={styles.lockTitle}>{planningProgress.title}</Text>
              <Text style={styles.lockText}>{planningProgress.message}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: pilotage.primaryColor,
                      width: `${Math.max(8, (planningProgress.current / planningProgress.target) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{planningProgress.progressText}</Text>
            </StitchCard>

            <InfoBanner
              icon="sparkles-outline"
              title="Prévisions utiles"
              text="Ce n’est pas un paywall : l’analyse s’ouvre quand les données deviennent assez fiables pour guider une décision."
              color={pilotage.primaryColor}
            />

            <SectionHeader title="Données disponibles" />
            {insights.map(item => (
              <InsightRow key={item.title} item={item} />
            ))}
          </>
        ) : (
          <>
            <SectionHeader title="Lecture des données" />
            <View style={styles.insightList}>
              {insights.map(item => (
                <InsightRow key={item.title} item={item} />
              ))}
            </View>

            <SectionHeader title="Prévisions" />
            <View style={styles.metricGrid}>
              <MetricCard
                icon="cash-outline"
                title="Trésorerie nette"
                subtitle="Recettes moins dépenses"
                value={formatFCFA(monthlyResult)}
                color={monthlyResult >= 0 ? theme.colors.success : theme.colors.error}
              />
              <MetricCard
                icon="pie-chart-outline"
                title="Taux de marge"
                subtitle="Sur les recettes du mois"
                value={monthlyRecettes > 0 ? formatPercent(marginRate) : 'A calculer'}
                color={pilotage.primaryColor}
              />
              <MetricCard
                icon="receipt-outline"
                title="Volume de données"
                subtitle="Transactions ce mois-ci"
                value={`${monthlyTransactions.length}`}
                color={theme.colors.secondary}
              />
            </View>

            {profileConfig?.features.showFinancementSection ? (
              <>
                <SectionHeader title="Financement" />
                <StitchCard style={styles.financeCard}>
                  <View style={[styles.financeIcon, { backgroundColor: `${pilotage.primaryColor}18` }]}>
                    <Ionicons name="folder-open-outline" size={22} color={pilotage.primaryColor} />
                  </View>
                  <View style={styles.financeCopy}>
                    <Text style={styles.financeTitle}>Dossier microfinance</Text>
                    <Text style={styles.financeText}>
                      Plan {profileConfig.subscription.currentPlan.label} · {monthlyTransactions.length} opération(s) du mois · {profileConfig.expertTriggers.length} vérification(s) prévue(s).
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={submittingExpert}
                    onPress={handleExpertRequest}
                    style={[styles.outlineButton, { borderColor: pilotage.primaryColor }]}
                  >
                    <Ionicons name="shield-checkmark-outline" size={16} color={pilotage.primaryColor} />
                    <Text style={[styles.outlineButtonText, { color: pilotage.primaryColor }]}>
                      {submittingExpert ? 'Envoi...' : 'Vérifier'}
                    </Text>
                  </TouchableOpacity>
                </StitchCard>
              </>
            ) : null}

            {profileConfig?.features.showExpertAssistance ? (
              <InfoBanner
                icon="shield-checkmark-outline"
                title="Expert contextuel"
                text="Les demandes expert restent liées à vos chiffres, à votre métier et aux déclencheurs configurés par C’PRO."
                color={theme.colors.success}
              />
            ) : null}
          </>
        )}

        {monthlyTransactions.length === 0 ? (
          <EmptyState
            icon="bar-chart-outline"
            title="Analyse en attente"
            text="Les indicateurs se rempliront automatiquement dès les premières opérations enregistrées."
            color={pilotage.primaryColor}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function InsightRow({ item }: { item: InsightItem }) {
  return (
    <StitchCard style={styles.insightRow}>
      <View style={[styles.rowIcon, { backgroundColor: `${item.color}18` }]}>
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowText}>{item.text}</Text>
      </View>
    </StitchCard>
  );
}

function MetricCard({
  icon,
  title,
  subtitle,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  value: string;
  color: string;
}) {
  return (
    <StitchCard style={styles.metricCard}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowText}>{subtitle}</Text>
      </View>
      <Amount value={value} color={color} size="sm" style={styles.metricValue} />
    </StitchCard>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  scroll: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    paddingBottom: 48,
  },
  lockCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  lockIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  lockTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    textAlign: 'center',
  },
  lockText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
  },
  progressTrack: {
    backgroundColor: theme.colors.border,
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '800',
  },
  insightList: {
    gap: theme.spacing.sm,
  },
  insightRow: {
    alignItems: 'flex-start',
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
  rowTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  rowText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 17,
    marginTop: 3,
  },
  metricGrid: {
    gap: theme.spacing.sm,
  },
  metricCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricValue: {
    maxWidth: 112,
    textAlign: 'right',
  },
  financeCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  financeIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  financeCopy: {
    flex: 1,
    minWidth: 0,
  },
  financeTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  financeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 17,
    marginTop: 3,
  },
  outlineButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  outlineButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
