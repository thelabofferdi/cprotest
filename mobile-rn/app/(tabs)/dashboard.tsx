import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ProfileLogo } from '../../src/shared/components/ProfileLogo';
import { useAuthStore } from '../../src/shared/hooks/useAuth';
import { useProfileStore } from '../../src/shared/hooks/useProfile';
import { useProfileConfigStore } from '../../src/shared/hooks/useProfileConfig';
import { useTransactionStore } from '../../src/shared/hooks/useTransactions';
import { useUIStore } from '../../src/shared/hooks/useUIStore';
import { formatFCFA } from '../../src/shared/utils/financial';
import { getTransactionCategoryLabel } from '../../src/shared/utils/data';
import { getExpertPrompt, getPilotageConfig } from '../../src/shared/utils/pilotage';
import { api } from '../../src/core/api/apiClient';
import { triggerSync } from '../../src/core/sync/syncService';
import { theme } from '../../src/theme';
import type { Transaction, TransactionType } from '../../src/types';

interface BackendIndicators {
  chiffreAffaires: number;
  resultatNet: number;
  tauxProfitabilite: number;
  tresorerieNette: number;
  seuilRentabilite: number;
  tauxDeMarge?: number;
  tauxMarge?: number;
  nombreTransactions?: number;
  periode?: string;
}

type BackendDashboardResponse = Partial<BackendIndicators> & {
  revenus?: { total?: number };
  charges?: { total?: number };
  benefice?: { net?: number; tauxMarge?: number };
  statistiques?: { nbTransactions?: number };
};

function isToday(date: string) {
  const txDate = new Date(date);
  const today = new Date();
  return txDate.toDateString() === today.toDateString();
}

function sumByType(transactions: Transaction[], type: TransactionType) {
  return transactions
    .filter(tx => tx.type === type)
    .reduce((sum, tx) => sum + tx.montant, 0);
}

function normalizeBackendIndicators(data: BackendDashboardResponse): BackendIndicators {
  const chiffreAffaires = data.chiffreAffaires ?? data.revenus?.total ?? 0;
  const resultatNet = data.resultatNet ?? data.benefice?.net ?? 0;
  const charges = data.charges?.total ?? Math.max(0, chiffreAffaires - resultatNet);

  return {
    chiffreAffaires,
    resultatNet,
    tauxProfitabilite: data.tauxProfitabilite ?? data.benefice?.tauxMarge ?? 0,
    tresorerieNette: data.tresorerieNette ?? chiffreAffaires - charges,
    seuilRentabilite: data.seuilRentabilite ?? 0,
    tauxDeMarge: data.tauxDeMarge ?? data.benefice?.tauxMarge ?? data.tauxMarge ?? 0,
    tauxMarge: data.tauxMarge ?? data.benefice?.tauxMarge ?? 0,
    nombreTransactions: data.nombreTransactions ?? data.statistiques?.nbTransactions ?? 0,
    periode: typeof data.periode === 'string' ? data.periode : undefined,
  };
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function DashboardScreen() {
  const userId = useAuthStore(s => s.userId);
  const profile = useProfileStore(s => s.profile);
  const profileLoading = useProfileStore(s => s.loading);
  const loadProfile = useProfileStore(s => s.loadProfile);
  const profileConfig = useProfileConfigStore(s => s.config);
  const loadProfileConfig = useProfileConfigStore(s => s.loadConfig);
  const transactions = useTransactionStore(s => s.transactions);
  const loadTransactions = useTransactionStore(s => s.loadTransactions);
  const { setActionsSheetVisible } = useUIStore();

  const [refreshing, setRefreshing] = useState(false);
  const [apiIndicators, setApiIndicators] = useState<BackendIndicators | null>(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [submittingExpert, setSubmittingExpert] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoadingApi(true);
    try {
      await triggerSync();
      const res = await api.getDashboard('month');
      setApiIndicators(normalizeBackendIndicators(res.data as BackendDashboardResponse));
    } catch {
      setApiIndicators(null);
      console.log('[Dashboard] Service distant indisponible, calcul local');
    } finally {
      setLoadingApi(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
      loadTransactions(userId);
      fetchDashboard();
    }
  }, [userId, loadProfile, loadTransactions, fetchDashboard]);

  useEffect(() => {
    if (profile) {
      loadProfileConfig(profile.metier);
    }
  }, [profile, loadProfileConfig]);

  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: profileConfig?.economicUnit,
  });
  const expertPrompt = getExpertPrompt(transactions, profileConfig, pilotage);

  const onRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    await Promise.all([
      loadProfile(userId),
      loadTransactions(userId),
      fetchDashboard(),
      loadProfileConfig(profile?.metier),
    ]);
    setRefreshing(false);
  };

  const monthlyTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      const date = new Date(tx.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  const monthlyRecettes = useMemo(() => sumByType(monthlyTransactions, 'recette'), [monthlyTransactions]);
  const monthlyDepenses = useMemo(() => sumByType(monthlyTransactions, 'depense'), [monthlyTransactions]);
  const monthlyBenefice = monthlyRecettes - monthlyDepenses;

  const dashboardIndicators = useMemo(() => {
    const hasSyncedIndicators = Boolean(apiIndicators && (apiIndicators.nombreTransactions ?? 0) > 0);
    const chiffreAffaires = hasSyncedIndicators ? apiIndicators?.chiffreAffaires ?? 0 : monthlyRecettes;
    const resultatNet = hasSyncedIndicators ? apiIndicators?.resultatNet ?? 0 : monthlyBenefice;
    const tresorerieNette = hasSyncedIndicators ? apiIndicators?.tresorerieNette ?? resultatNet : monthlyRecettes - monthlyDepenses;
    const tauxMarge = hasSyncedIndicators
      ? apiIndicators?.tauxDeMarge ?? apiIndicators?.tauxMarge ?? apiIndicators?.tauxProfitabilite ?? 0
      : chiffreAffaires > 0
        ? (resultatNet / chiffreAffaires) * 100
        : 0;

    return {
      chiffreAffaires,
      resultatNet,
      tresorerieNette,
      tauxMarge,
      depenses: hasSyncedIndicators ? Math.max(0, chiffreAffaires - resultatNet) : monthlyDepenses,
      nombreTransactions: hasSyncedIndicators ? apiIndicators?.nombreTransactions ?? 0 : monthlyTransactions.length,
    };
  }, [apiIndicators, monthlyBenefice, monthlyDepenses, monthlyRecettes, monthlyTransactions.length]);

  const contextualAdvice = useMemo(() => {
    if (dashboardIndicators.nombreTransactions === 0) {
      return `Ajoutez vos premières recettes et dépenses pour obtenir une lecture fiable de ${pilotage.unitLabel.toLowerCase()}.`;
    }

    if (dashboardIndicators.resultatNet < 0) {
      return 'Les dépenses dépassent les recettes sur la période. Regardez les dernières sorties avant un nouvel engagement.';
    }

    if (profileConfig?.features.showFinancialPlanning) {
      return `${pilotage.planPromise} Les recommandations s'appuient sur vos transactions récentes.`;
    }

    return `${pilotage.planPromise} Continuez la saisie régulière pour rendre les alertes plus précises.`;
  }, [dashboardIndicators.nombreTransactions, dashboardIndicators.resultatNet, pilotage.planPromise, pilotage.unitLabel, profileConfig?.features.showFinancialPlanning]);

  const recentActivities = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .slice(0, 3)
      .map((tx) => {
        const isRecette = tx.type === 'recette';
        return {
          id: tx.txId,
          title: isRecette ? 'Entrée enregistrée' : 'Sortie enregistrée',
          desc: `${getTransactionCategoryLabel(tx.categorie)} · ${isRecette ? '+' : '-'}${formatFCFA(tx.montant)}`,
          dateStr: isToday(tx.date)
            ? `Aujourd'hui, ${new Date(tx.createdAt || tx.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
            : new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          icon: isRecette ? ('arrow-up' as const) : ('arrow-down' as const),
          color: isRecette ? theme.colors.success : theme.colors.warning,
          bg: isRecette ? theme.colors.successLight : theme.colors.warningLight,
        };
      });
  }, [transactions]);

  const lastSavedTransactionAlert = useMemo(() => {
    if (transactions.length === 0) return null;
    const tx = [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const timeDiff = Date.now() - new Date(tx.createdAt).getTime();
    return timeDiff > 0 && timeDiff < 15000 ? tx : null;
  }, [transactions]);

  const handleExpertPrompt = async () => {
    if (!expertPrompt) return;
    setSubmittingExpert(true);
    try {
      await api.createExpertRequest({
        reason: expertPrompt.trigger,
        details: expertPrompt.message,
        context: {
          metier: profileConfig?.metier?.slug ?? profile?.metier,
          economicUnit: pilotage.economicUnit,
          plan: profileConfig?.recommendedPlan,
          source: 'dashboard-contextual-banner',
        },
      });
      Alert.alert('Demande envoyée', 'Un expert C’PRO va relire vos chiffres avec le contexte de votre activité.');
    } catch {
      Alert.alert('Demande non envoyée', 'Veuillez vérifier votre connexion Internet.');
    } finally {
      setSubmittingExpert(false);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyProfile}>
          {profileLoading && <ActivityIndicator size="large" color={theme.colors.primary} />}
          <Text style={styles.emptyTitle}>Bienvenue sur C'PRO</Text>
          <Text style={styles.emptyText}>Configure ton activité pour obtenir ton tableau de suivi.</Text>
          {!profileLoading && (
            <TouchableOpacity style={styles.setupButton} onPress={() => router.replace('/(onboarding)/profile-select')}>
              <Text style={styles.setupButtonText}>Configurer mon profil</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Bonjour, {profile.nom}</Text>
          <Text style={styles.headerSubtitle}>{pilotage.unitLabel}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.86} style={styles.profileAvatar} onPress={() => router.push('/(tabs)/profil')}>
          <ProfileLogo profile={profile} size={40} color={pilotage.primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loadingApi && (
          <View style={styles.syncRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.syncText}>Mise à jour des données...</Text>
          </View>
        )}

        <View style={[styles.pilotageCard, { backgroundColor: pilotage.primaryColor }]}>
          <View style={styles.pilotageCopy}>
            <Text style={styles.pilotageUnit}>{pilotage.unitLabel}</Text>
            <Text style={styles.pilotageQuestion}>{pilotage.centralQuestion}</Text>
            <TouchableOpacity style={styles.pilotageButton} onPress={() => setActionsSheetVisible(true)}>
              <Text style={styles.pilotageButtonText}>{pilotage.primaryCta}</Text>
              <Ionicons name="arrow-forward" size={14} color="#0C1A30" />
            </TouchableOpacity>
          </View>
          <Text style={styles.pilotageIcon}>{pilotage.icon}</Text>
        </View>

        {expertPrompt && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.expertBanner}
            onPress={handleExpertPrompt}
            disabled={submittingExpert}
          >
            <View style={[styles.expertIcon, { backgroundColor: `${pilotage.primaryColor}18` }]}>
              <Ionicons name="shield-checkmark" size={20} color={pilotage.primaryColor} />
            </View>
            <View style={styles.expertCopy}>
              <Text style={styles.expertTitle}>{expertPrompt.title}</Text>
              <Text style={styles.expertMessage}>{expertPrompt.message}</Text>
              <Text style={[styles.expertCta, { color: pilotage.primaryColor }]}>
                {submittingExpert ? 'Envoi en cours...' : expertPrompt.cta}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}

        <View style={styles.dashboardSection}>
          <View style={styles.mainKpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>{pilotage.dashboardTitle}</Text>
              <View style={[styles.kpiIconBg, { backgroundColor: `${pilotage.primaryColor}18` }]}>
                <Text style={styles.kpiIconText}>{pilotage.icon}</Text>
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: dashboardIndicators.resultatNet >= 0 ? theme.colors.success : theme.colors.error }]}>
              {formatFCFA(dashboardIndicators.resultatNet)}
            </Text>
            <Text style={styles.kpiSubtext}>{profileConfig?.metier.nom ?? pilotage.accountingLabel} · Mois en cours</Text>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.subKpiCard}>
              <View style={[styles.subKpiIconBg, { backgroundColor: theme.colors.successLight }]}>
                <Ionicons name="arrow-up" size={16} color={theme.colors.success} />
              </View>
              <Text style={styles.subKpiLabel}>Recettes</Text>
              <Text style={[styles.subKpiValue, { color: theme.colors.success }]}>{formatFCFA(dashboardIndicators.chiffreAffaires)}</Text>
              <Text style={styles.subKpiSubtext}>Période en cours</Text>
            </View>

            <View style={styles.subKpiCard}>
              <View style={[styles.subKpiIconBg, { backgroundColor: theme.colors.errorLight }]}>
                <Ionicons name="arrow-down" size={16} color={theme.colors.error} />
              </View>
              <Text style={styles.subKpiLabel}>Dépenses</Text>
              <Text style={[styles.subKpiValue, { color: theme.colors.error }]}>{formatFCFA(dashboardIndicators.depenses)}</Text>
              <Text style={styles.subKpiSubtext}>Charges comptabilisées</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="wallet-outline" size={18} color={pilotage.primaryColor} />
              <Text style={styles.summaryTitle}>Résumé</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Trésorerie nette</Text>
                <Text style={styles.summaryValue}>{formatFCFA(dashboardIndicators.tresorerieNette)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Marge</Text>
                <Text style={styles.summaryValue}>{dashboardIndicators.chiffreAffaires > 0 ? formatPercent(dashboardIndicators.tauxMarge) : 'A calculer'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="bulb" size={20} color={theme.colors.secondary} />
              <Text style={styles.aiTitle}>Repère</Text>
            </View>
            <Text style={styles.aiText}>{contextualAdvice}</Text>
            <TouchableOpacity style={styles.aiButton} onPress={() => router.push('/(tabs)/analyse')}>
              <Text style={[styles.aiButtonText, { color: pilotage.primaryColor }]}>Voir {pilotage.analyseLabel.toLowerCase()}</Text>
              <Ionicons name="arrow-forward" size={14} color={pilotage.primaryColor} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/journal')}>
            <Text style={styles.viewAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {lastSavedTransactionAlert && (
          <View style={styles.savedBanner}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
            <Text style={styles.savedText} numberOfLines={1}>{getTransactionCategoryLabel(lastSavedTransactionAlert.categorie)} enregistré</Text>
          </View>
        )}

        <View style={styles.activitiesContainer}>
          {recentActivities.length === 0 ? (
            <View style={styles.emptyActivities}>
              <Ionicons name="receipt-outline" size={20} color="#94A3B8" />
              <Text style={styles.emptyActivitiesTitle}>Aucune activité enregistrée</Text>
              <Text style={styles.emptyActivitiesText}>Utilisez le bouton central pour ajouter votre première opération.</Text>
            </View>
          ) : recentActivities.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityRow} onPress={() => router.push('/(tabs)/journal')}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityIconCircle, { backgroundColor: activity.bg }]}>
                  <Ionicons name={activity.icon} size={18} color={activity.color} />
                </View>
                <View style={styles.activityTexts}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDesc} numberOfLines={1}>{activity.desc}</Text>
                </View>
              </View>

              <View style={styles.activityRight}>
                <Text style={styles.activityDate}>{activity.dateStr}</Text>
                <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: 72,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  greetingContainer: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  greeting: {
    color: '#0C1A30',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  profileAvatar: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  scroll: {
    backgroundColor: '#F9FAFC',
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  syncRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  syncText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  pilotageCard: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  pilotageCopy: {
    flex: 1,
    gap: 7,
  },
  pilotageUnit: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pilotageQuestion: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  pilotageButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pilotageButtonText: {
    color: '#0C1A30',
    fontSize: 12,
    fontWeight: '900',
  },
  pilotageIcon: {
    fontSize: 42,
    marginLeft: 12,
  },
  expertBanner: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    padding: 14,
  },
  expertIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  expertCopy: {
    flex: 1,
  },
  expertTitle: {
    color: '#0C1A30',
    fontSize: 13,
    fontWeight: '900',
  },
  expertMessage: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  expertCta: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
  },
  dashboardSection: {
    gap: 16,
    marginBottom: 16,
  },
  mainKpiCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  kpiIconBg: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  kpiIconText: {
    fontSize: 18,
  },
  kpiValue: {
    color: '#0C1A30',
    fontSize: 26,
    fontWeight: '800',
  },
  kpiSubtext: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  subKpiCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  subKpiIconBg: {
    alignItems: 'center',
    borderRadius: 10,
    height: 30,
    justifyContent: 'center',
    marginBottom: 8,
    width: 30,
  },
  subKpiLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subKpiValue: {
    color: '#0C1A30',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  subKpiSubtext: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  summaryTitle: {
    color: '#0C1A30',
    fontSize: 14,
    fontWeight: '800',
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryValue: {
    color: '#0C1A30',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryDivider: {
    backgroundColor: '#E2E8F0',
    height: 40,
    width: 1,
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFD8A8',
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  aiHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  aiTitle: {
    color: '#D97706',
    fontSize: 14,
    fontWeight: '800',
  },
  aiText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  aiButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#0C1A30',
    fontSize: 17,
    fontWeight: '800',
  },
  viewAllText: {
    color: '#0055FF',
    fontSize: 12,
    fontWeight: '800',
  },
  savedBanner: {
    alignItems: 'center',
    backgroundColor: theme.colors.successLight,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    padding: 12,
  },
  savedText: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 13,
  },
  activitiesContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activityRow: {
    alignItems: 'center',
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  activityLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  activityIconCircle: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  activityTexts: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    color: '#0C1A30',
    fontSize: 13,
    fontWeight: '800',
  },
  activityDesc: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  activityRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  activityDate: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyActivities: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyActivitiesTitle: {
    color: '#0C1A30',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyActivitiesText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  emptyProfile: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  setupButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
