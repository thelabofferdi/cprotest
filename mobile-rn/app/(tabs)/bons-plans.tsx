import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppHeader } from '../../src/shared/components/AppHeader';
import {
  EmptyState,
  InfoBanner,
  PageIntro,
  SectionHeader,
  StitchCard,
} from '../../src/shared/components/StitchPrimitives';
import { useProfileConfigStore } from '../../src/shared/hooks/useProfileConfig';
import { useProfileStore } from '../../src/shared/hooks/useProfile';
import { useTransactionStore } from '../../src/shared/hooks/useTransactions';
import { getPilotageConfig } from '../../src/shared/utils/pilotage';
import { api } from '../../src/core/api/apiClient';
import { theme } from '../../src/theme';

interface InsightItem {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function BonsPlansScreen() {
  const profileConfig = useProfileConfigStore(s => s.config);
  const profile = useProfileStore(s => s.profile);
  const transactions = useTransactionStore(s => s.transactions);
  const [submittingExpert, setSubmittingExpert] = useState(false);
  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: profileConfig?.economicUnit,
  });

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

  const insightItems = useMemo<InsightItem[]>(() => {
    if (monthlyTransactions.length === 0) {
      return [{
        title: 'Premières données',
        desc: `Les conseils se débloquent à partir des opérations ${pilotage.unitLabel.toLowerCase()} enregistrées dans le journal.`,
        icon: 'create-outline',
        color: pilotage.primaryColor,
      }];
    }

    const result = monthlyRecettes - monthlyDepenses;
    const chargeRate = monthlyRecettes > 0 ? (monthlyDepenses / monthlyRecettes) * 100 : 0;

    return [
      {
        title: 'Résultat du mois',
        desc: result >= 0
          ? `Résultat positif de ${result.toLocaleString('fr-FR')} FCFA sur la période.`
          : `Résultat négatif de ${Math.abs(result).toLocaleString('fr-FR')} FCFA sur la période.`,
        icon: result >= 0 ? 'trending-up-outline' : 'warning-outline',
        color: result >= 0 ? theme.colors.success : theme.colors.error,
      },
      {
        title: 'Poids des charges',
        desc: monthlyRecettes > 0
          ? `Les dépenses représentent ${formatPercent(chargeRate)} des recettes enregistrées.`
          : 'Ajoutez au moins une recette pour comparer vos dépenses.',
        icon: 'analytics-outline',
        color: theme.colors.warning,
      },
      {
        title: 'Mode de pilotage',
        desc: profileConfig
          ? `${profileConfig.metier.nom} · ${profileConfig.subscription.currentPlan.label}. ${pilotage.centralQuestion}`
          : 'Votre mode se précisera après la configuration de l’activité.',
        icon: 'compass-outline',
        color: pilotage.primaryColor,
      },
    ];
  }, [monthlyDepenses, monthlyRecettes, monthlyTransactions.length, pilotage.primaryColor, pilotage.unitLabel, profileConfig]);

  const handleExpertRequest = async () => {
    if (!profileConfig) return;

    setSubmittingExpert(true);
    try {
      await api.createExpertRequest({
        reason: profileConfig.expertTriggers[0] ?? 'demande-conseil',
        details: `Demande depuis conseils - plan ${profileConfig.recommendedPlan}`,
        context: {
          metier: profileConfig.metier.slug,
          plan: profileConfig.recommendedPlan,
          options: profileConfig.options,
          triggers: profileConfig.expertTriggers,
          source: 'bons-plans',
        },
      });
      Alert.alert('Demande envoyée', 'Un expert C’PRO a bien reçu votre demande.');
    } catch {
      Alert.alert('Demande non envoyée', 'Veuillez vérifier votre connexion Internet.');
    } finally {
      setSubmittingExpert(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader title="Conseils" subtitle={pilotage.unitLabel} showSettings={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageIntro
          eyebrow={profileConfig?.subscription.currentPlan.label ?? 'Conseils'}
          title="Recommandations"
          subtitle={pilotage.planPromise}
          icon="bulb-outline"
          color={pilotage.primaryColor}
        />

        <InfoBanner
          icon="compass-outline"
          title={pilotage.accountingLabel}
          text={pilotage.centralQuestion}
          color={pilotage.primaryColor}
        />

        <SectionHeader title="Lecture rapide" />
        <View style={styles.insightList}>
          {insightItems.map(item => (
            <StitchCard key={item.title} style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.insightCopy}>
                <Text style={styles.insightTitle}>{item.title}</Text>
                <Text style={styles.insightText}>{item.desc}</Text>
              </View>
            </StitchCard>
          ))}
        </View>

        {profileConfig?.features.showExpertAssistance ? (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={submittingExpert}
            onPress={handleExpertRequest}
            style={[styles.primaryAction, { backgroundColor: pilotage.primaryColor }]}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>{submittingExpert ? 'Demande en cours...' : 'Faire vérifier mes chiffres'}</Text>
          </TouchableOpacity>
        ) : (
          <InfoBanner
            icon="information-circle-outline"
            title="Expert contextuel"
            text="L’assistance expert apparaît quand vos données déclenchent un besoin réel."
            color={theme.colors.textSecondary}
          />
        )}

        {profileConfig?.features.showFinancementSection ? (
          <StitchCard style={styles.financeCard}>
            <View style={styles.financeHeader}>
              <View style={[styles.financeIcon, { backgroundColor: `${pilotage.primaryColor}18` }]}>
                <Ionicons name="folder-open-outline" size={20} color={pilotage.primaryColor} />
              </View>
              <View style={styles.financeCopy}>
                <Text style={styles.financeTitle}>Dossier microfinance</Text>
                <Text style={styles.financeText}>Préparation basée sur votre plan, vos documents et vos opérations.</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.outlineAction, { borderColor: pilotage.primaryColor }]} onPress={() => router.push('/(tabs)/documents')}>
              <Text style={[styles.outlineActionText, { color: pilotage.primaryColor }]}>Ouvrir les documents</Text>
              <Ionicons name="arrow-forward" size={16} color={pilotage.primaryColor} />
            </TouchableOpacity>
          </StitchCard>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="Conseils à venir"
            text="Les recommandations deviendront plus précises avec vos premières opérations."
            color={pilotage.primaryColor}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { gap: theme.spacing.md, padding: theme.spacing.md, paddingBottom: 48 },
  insightList: { gap: theme.spacing.sm },
  insightCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  insightIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  insightCopy: { flex: 1 },
  insightTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  insightText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  primaryActionText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  financeCard: { gap: theme.spacing.md },
  financeHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  financeIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  financeCopy: { flex: 1 },
  financeTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  financeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  outlineAction: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    height: 40,
    paddingHorizontal: theme.spacing.md,
  },
  outlineActionText: {
    ...theme.typography.caption,
    fontWeight: '900',
  },
});
