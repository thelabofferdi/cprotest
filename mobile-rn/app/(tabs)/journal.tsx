import React, { useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { ProfileLogo } from '../../src/shared/components/ProfileLogo';
import { QuickTransactionModal } from '../../src/shared/components/QuickTransactionModal';
import { useProfileStore } from '../../src/shared/hooks/useProfile';
import { useProfileConfigStore } from '../../src/shared/hooks/useProfileConfig';
import { useTransactionStore } from '../../src/shared/hooks/useTransactions';
import { getTransactionCategoryLabel } from '../../src/shared/utils/data';
import { formatFCFA } from '../../src/shared/utils/financial';
import { getPilotageConfig } from '../../src/shared/utils/pilotage';
import type { Transaction, TransactionType } from '../../src/types';

type Period = 'today' | 'week' | 'month' | 'all';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface PeriodSummary {
  recettes: number;
  depenses: number;
  benefice: number;
  count: number;
  recetteCount: number;
  depenseCount: number;
}

interface StoryState {
  badge: string;
  title: string;
  color: string;
  soft: string;
  cta: string;
  icon: IoniconName;
}

interface MetricCardData {
  label: string;
  value: string;
  detail: string;
  icon: MaterialIconName;
  color: string;
  bg: string;
  series: number[];
  chart: 'line' | 'bars';
}

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: "Aujourd'hui" },
  { id: 'week', label: '7 jours' },
  { id: 'month', label: 'Mois' },
  { id: 'all', label: 'Tout' },
];

const palette = {
  ink: '#09123B',
  muted: '#5E6A86',
  softText: '#7C89A6',
  blue: '#0874FF',
  blueSoft: '#EAF4FF',
  green: '#00B981',
  greenSoft: '#E8FFF7',
  red: '#EF3348',
  redSoft: '#FFF0F1',
  orange: '#F59E0B',
  orangeSoft: '#FFF7E9',
  line: '#E7ECF5',
  surface: '#FFFFFF',
  background: '#F8FBFF',
};

function isSameDay(date: string, reference: Date) {
  return new Date(date).toDateString() === reference.toDateString();
}

function isInPeriod(tx: Transaction, period: Period) {
  const now = new Date();
  const date = new Date(tx.date);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (period === 'today') return isSameDay(tx.date, now);
  if (period === 'week') return diffDays >= 0 && diffDays < 7;
  if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  return true;
}

function isInPreviousPeriod(tx: Transaction, period: Period) {
  const now = new Date();
  const date = new Date(tx.date);

  if (period === 'today') {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return isSameDay(tx.date, yesterday);
  }

  if (period === 'week') {
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    return diffDays >= 7 && diffDays < 14;
  }

  if (period === 'month') {
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return date.getMonth() === previous.getMonth() && date.getFullYear() === previous.getFullYear();
  }

  return false;
}

function summarize(transactions: Transaction[]): PeriodSummary {
  const recettes = transactions.filter(tx => tx.type === 'recette');
  const depenses = transactions.filter(tx => tx.type === 'depense');
  const recettesTotal = recettes.reduce((sum, tx) => sum + tx.montant, 0);
  const depensesTotal = depenses.reduce((sum, tx) => sum + tx.montant, 0);

  return {
    recettes: recettesTotal,
    depenses: depensesTotal,
    benefice: recettesTotal - depensesTotal,
    count: transactions.length,
    recetteCount: recettes.length,
    depenseCount: depenses.length,
  };
}

function sortByLatest(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => {
    const bTime = new Date(b.createdAt || b.date).getTime();
    const aTime = new Date(a.createdAt || a.date).getTime();
    return bTime - aTime;
  });
}

function formatShortFCFA(value: number) {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Md FCFA`;
  }

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M FCFA`;
  }

  return formatFCFA(value);
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`;
}

function formatDateLine(period: Period) {
  if (period === 'week') return 'Les 7 derniers jours';
  if (period === 'month') return 'Ce mois-ci';
  if (period === 'all') return 'Toute la période';

  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Aujourd’hui, ${date}`;
}

function getPeriodCopy(period: Period) {
  if (period === 'today') return 'aujourd’hui';
  if (period === 'week') return 'sur 7 jours';
  if (period === 'month') return 'ce mois-ci';
  return 'sur la période';
}

function getFirstName(name?: string | null) {
  return name?.split(' ').filter(Boolean)[0] ?? 'C’PRO';
}

function getPaymentMode(mode: Transaction['modePaiement']) {
  if (mode === 'mobile_money') return 'Mobile Money';
  if (mode === 'credit') return 'Crédit';
  return 'Espèces';
}

function formatMovementDate(tx: Transaction) {
  const date = new Date(tx.date);
  const time = new Date(tx.createdAt || tx.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${day} · ${time} · ${getPaymentMode(tx.modePaiement)}`;
}

function formatFullDate(date: string) {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getCategoryIcon(category: string, isRecette: boolean): IoniconName {
  const normalized = category.toLowerCase();
  if (['transport', 'carburant', 'livraison'].some(key => normalized.includes(key))) return 'car-outline';
  if (['acompte', 'credit', 'crédit'].some(key => normalized.includes(key))) return 'card-outline';
  if (['vente', 'commande', 'client'].some(key => normalized.includes(key))) return 'bag-handle-outline';
  if (['imprevu', 'imprévu', 'perte'].some(key => normalized.includes(key))) return 'alert-circle-outline';
  return isRecette ? 'bag-handle-outline' : 'pricetag-outline';
}

function getMovementTitle(tx: Transaction) {
  if (tx.type === 'recette') {
    return tx.client ? `Vente à ${tx.client}` : getTransactionCategoryLabel(tx.categorie);
  }

  return getTransactionCategoryLabel(tx.categorie);
}

function getStory(summary: PeriodSummary, period: Period): StoryState {
  const periodCopy = getPeriodCopy(period);

  if (summary.count === 0) {
    return {
      badge: 'ACTIVITÉ À RENSEIGNER',
      title: `Aucune commande ${periodCopy}.`,
      color: palette.muted,
      soft: '#F1F5F9',
      cta: 'Ajouter une opération',
      icon: 'alert-circle',
    };
  }

  if (summary.benefice < 0) {
    return {
      badge: 'ACTIVITÉ SOUS PRESSION',
      title: `Les dépenses dépassent les recettes ${periodCopy}.`,
      color: palette.red,
      soft: palette.redSoft,
      cta: 'Comprendre pourquoi',
      icon: 'alert-circle',
    };
  }

  if (summary.benefice > 0) {
    return {
      badge: 'ACTIVITÉ POSITIVE',
      title: `Les recettes dépassent les dépenses ${periodCopy}.`,
      color: palette.green,
      soft: palette.greenSoft,
      cta: 'Voir les détails',
      icon: 'arrow-up',
    };
  }

  return {
    badge: 'ACTIVITÉ STABLE',
    title: `Les recettes couvrent les dépenses ${periodCopy}.`,
    color: palette.orange,
    soft: palette.orangeSoft,
    cta: 'Voir les détails',
    icon: 'alert-circle',
  };
}

function getVariationLabel(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? '0% vs avant' : 'Nouveau mouvement';
  }

  const value = Math.round(((current - previous) / Math.abs(previous)) * 100);
  return `${value > 0 ? '+' : ''}${value}% vs avant`;
}

function buildDailySeries(transactions: Transaction[], type: TransactionType | 'activity', days = 7) {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const reference = new Date(today);
    reference.setDate(today.getDate() - (days - 1 - index));
    const dayTransactions = transactions.filter(tx => isSameDay(tx.date, reference));

    if (type === 'activity') return dayTransactions.length;
    return dayTransactions
      .filter(tx => tx.type === type)
      .reduce((sum, tx) => sum + tx.montant, 0);
  });
}

function buildSparkPath(series: number[], width = 76, height = 30) {
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const range = Math.max(max - min, 1);

  return series
    .map((value, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function findTopExpense(transactions: Transaction[]) {
  const totals = new Map<string, { total: number; tx: Transaction }>();

  transactions
    .filter(tx => tx.type === 'depense')
    .forEach(tx => {
      const current = totals.get(tx.categorie);
      if (!current) {
        totals.set(tx.categorie, { total: tx.montant, tx });
        return;
      }
      totals.set(tx.categorie, { total: current.total + tx.montant, tx: current.tx.montant >= tx.montant ? current.tx : tx });
    });

  return [...totals.entries()].sort((a, b) => b[1].total - a[1].total)[0] ?? null;
}

export default function JournalScreen() {
  const { width } = useWindowDimensions();
  const transactions = useTransactionStore(s => s.transactions);
  const profile = useProfileStore(s => s.profile);
  const profileConfig = useProfileConfigStore(s => s.config);
  const [modalVisible, setModalVisible] = useState(false);
  const [quickType, setQuickType] = useState<TransactionType>('recette');
  const [lastSaved, setLastSaved] = useState<Transaction | null>(null);
  const [period, setPeriod] = useState<Period>('today');
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const compact = width < 390;
  const chartWidth = compact ? 62 : 86;

  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: profileConfig?.economicUnit,
  });

  const sortedTransactions = useMemo(() => sortByLatest(transactions), [transactions]);
  const filteredTransactions = useMemo(
    () => sortedTransactions.filter(tx => isInPeriod(tx, period)),
    [period, sortedTransactions],
  );
  const previousTransactions = useMemo(
    () => sortedTransactions.filter(tx => isInPreviousPeriod(tx, period)),
    [period, sortedTransactions],
  );
  const summary = useMemo(() => summarize(filteredTransactions), [filteredTransactions]);
  const previousSummary = useMemo(() => summarize(previousTransactions), [previousTransactions]);
  const story = useMemo(() => getStory(summary, period), [period, summary]);
  const topExpense = useMemo(() => findTopExpense(filteredTransactions), [filteredTransactions]);
  const largestMovement = useMemo(() => {
    const source = summary.benefice < 0
      ? filteredTransactions.filter(tx => tx.type === 'depense')
      : filteredTransactions;
    return [...source].sort((a, b) => b.montant - a.montant)[0] ?? null;
  }, [filteredTransactions, summary.benefice]);

  const metrics = useMemo<MetricCardData[]>(() => [
    {
      label: 'Argent reçu',
      value: formatShortFCFA(summary.recettes),
      detail: formatCount(summary.recetteCount, 'vente', 'ventes'),
      icon: 'wallet-plus-outline',
      color: palette.green,
      bg: palette.greenSoft,
      series: buildDailySeries(sortedTransactions, 'recette'),
      chart: 'line',
    },
    {
      label: 'Argent dépensé',
      value: formatShortFCFA(summary.depenses),
      detail: formatCount(summary.depenseCount, 'dépense', 'dépenses'),
      icon: 'receipt-text-outline',
      color: palette.red,
      bg: palette.redSoft,
      series: buildDailySeries(sortedTransactions, 'depense'),
      chart: 'line',
    },
    {
      label: 'Activité',
      value: String(summary.count),
      detail: 'Opérations',
      icon: 'bank-transfer',
      color: palette.blue,
      bg: palette.blueSoft,
      series: buildDailySeries(sortedTransactions, 'activity'),
      chart: 'bars',
    },
  ], [sortedTransactions, summary.count, summary.depenseCount, summary.depenses, summary.recetteCount, summary.recettes]);

  const attention = useMemo(() => {
    if (topExpense) {
      const [category, value] = topExpense;
      const percent = summary.depenses > 0 ? Math.round((value.total / summary.depenses) * 100) : 0;
      return {
        title: 'Ce qui mérite votre attention',
        text: `Vos dépenses de ${getTransactionCategoryLabel(category).toLowerCase()} représentent ${percent}% de vos charges ${getPeriodCopy(period)}.`,
        tx: value.tx,
        color: palette.orange,
      };
    }

    if (summary.count === 0) {
      return {
        title: 'Ce qui mérite votre attention',
        text: 'Ajoutez une première commande ou dépense pour obtenir une lecture utile.',
        tx: null,
        color: palette.orange,
      };
    }

    return {
      title: 'Ce qui mérite votre attention',
      text: summary.benefice >= 0
        ? 'Les encaissements couvrent les sorties sur cette période.'
        : 'Une sortie importante pèse sur le solde de cette période.',
      tx: largestMovement,
      color: summary.benefice >= 0 ? palette.green : palette.orange,
    };
  }, [largestMovement, period, summary.benefice, summary.count, summary.depenses, topExpense]);

  const openQuickAdd = (type: TransactionType) => {
    setQuickType(type);
    setModalVisible(true);
  };

  const handleHeroAction = () => {
    if (summary.count === 0) {
      openQuickAdd('recette');
      return;
    }
    if (largestMovement) setSelectedTransaction(largestMovement);
  };

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    const isRecette = item.type === 'recette';
    const color = isRecette ? palette.green : palette.red;
    const isLast = index === filteredTransactions.length - 1;

    return (
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => setSelectedTransaction(item)}
        style={[
          styles.movementRow,
          compact && styles.movementRowCompact,
          index === 0 && styles.movementRowFirst,
          isLast && styles.movementRowLast,
          !isLast && styles.movementRowBorder,
        ]}
      >
        <View style={[styles.movementIcon, { backgroundColor: isRecette ? palette.greenSoft : palette.redSoft }]}>
          <Ionicons name={getCategoryIcon(item.categorie, isRecette)} size={20} color={color} />
        </View>

        <View style={styles.movementCopy}>
          <Text style={styles.movementTitle} numberOfLines={1}>{getMovementTitle(item)}</Text>
          <Text style={styles.movementMeta} numberOfLines={1}>{formatMovementDate(item)}</Text>
        </View>

        <View style={[styles.movementAmountWrap, compact && styles.movementAmountWrapCompact]}>
          <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={[styles.movementAmount, { color }]}>
            {isRecette ? '+' : '-'}{formatShortFCFA(item.montant)}
          </Text>
          <Ionicons name="chevron-down" size={18} color={palette.softText} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.txId}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, compact && styles.listContentCompact]}
        ListHeaderComponent={
          <View style={styles.contentTop}>
            <View style={[styles.header, compact && styles.headerCompact]}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.82}
                style={styles.menuButton}
                onPress={() => setPeriodMenuVisible(value => !value)}
              >
                <Ionicons name="menu" size={compact ? 25 : 28} color={palette.ink} />
              </TouchableOpacity>

              <View style={styles.headerCopy}>
                <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.greeting}>Bonjour, {getFirstName(profile?.nom)} 👋</Text>
                <Text numberOfLines={1} style={styles.headerSubtitle}>Vue d’ensemble de votre activité</Text>
                <TouchableOpacity style={styles.dateButton} activeOpacity={0.78} onPress={() => setPeriodMenuVisible(value => !value)}>
                  <Text numberOfLines={1} style={styles.dateText}>{formatDateLine(period)}</Text>
                  <Ionicons name="chevron-down" size={14} color={palette.blue} />
                </TouchableOpacity>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  activeOpacity={0.84}
                  style={styles.bellButton}
                  onPress={() => {
                    if (lastSaved) setSelectedTransaction(lastSaved);
                    else if (attention.tx) setSelectedTransaction(attention.tx);
                    else setPeriodMenuVisible(value => !value);
                  }}
                >
                  <MaterialCommunityIcons name="bell-outline" size={compact ? 23 : 26} color={palette.ink} />
                  {lastSaved ? <View style={styles.bellDot} /> : null}
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.86} onPress={() => router.push('/(tabs)/profil')}>
                  <ProfileLogo profile={profile} size={compact ? 46 : 54} color={pilotage.primaryColor} style={styles.avatar} />
                </TouchableOpacity>
              </View>
            </View>

            {periodMenuVisible ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
                {PERIODS.map(item => {
                  const active = item.id === period;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.82}
                      style={[styles.periodChip, active && { backgroundColor: palette.blue, borderColor: palette.blue }]}
                      onPress={() => {
                        setPeriod(item.id);
                        setPeriodMenuVisible(false);
                      }}
                    >
                      <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            <View style={[styles.heroCard, compact && styles.heroCardCompact, { backgroundColor: story.soft, borderColor: `${story.color}1F`, shadowColor: story.color }]}>
              <View style={[styles.heroCopy, compact && styles.heroCopyCompact]}>
                <View style={[styles.statusPill, compact && styles.statusPillCompact]}>
                  <Ionicons name={story.icon} size={15} color={story.color} />
                  <Text numberOfLines={1} style={[styles.statusText, { color: story.color }]}>{story.badge}</Text>
                </View>

                <Text adjustsFontSizeToFit minimumFontScale={0.82} style={styles.heroTitle} numberOfLines={2}>{story.title}</Text>
                <Text adjustsFontSizeToFit minimumFontScale={0.65} numberOfLines={1} style={[styles.heroAmount, { color: story.color }]}>
                  {summary.benefice > 0 ? '+' : ''}{formatShortFCFA(summary.benefice)}
                </Text>

                <View style={styles.trendChip}>
                  <Ionicons name={summary.benefice >= previousSummary.benefice ? 'arrow-up' : 'arrow-down'} size={15} color={story.color} />
                  <Text style={[styles.trendText, { color: story.color }]}>{getVariationLabel(summary.benefice, previousSummary.benefice)}</Text>
                </View>

                <TouchableOpacity activeOpacity={0.86} style={[styles.heroButton, compact && styles.heroButtonCompact, { backgroundColor: story.color }]} onPress={handleHeroAction}>
                  <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.heroButtonText}>{story.cta}</Text>
                  <Ionicons name="chevron-forward" size={19} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <HeroIllustration color={story.color} compact={compact} positive={summary.benefice >= 0} />
            </View>

            <View style={[styles.metricsRow, compact && styles.metricsRowCompact]}>
              {metrics.map(metric => (
                <View key={metric.label} style={[styles.metricCard, compact && styles.metricCardCompact]}>
                  <View style={[styles.metricIcon, compact && styles.metricIconCompact, { backgroundColor: metric.bg }]}>
                    <MaterialCommunityIcons name={metric.icon} size={22} color={metric.color} />
                  </View>
                  <Text numberOfLines={2} style={styles.metricLabel}>{metric.label}</Text>
                  <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={[styles.metricValue, { color: metric.color }]}>
                    {metric.value}
                  </Text>
                  <Text numberOfLines={1} style={styles.metricDetail}>{metric.detail}</Text>
                  {metric.chart === 'line' ? <SparkLine series={metric.series} color={metric.color} width={chartWidth} /> : <MiniBars series={metric.series} color={metric.color} width={chartWidth} />}
                </View>
              ))}
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity activeOpacity={0.88} style={[styles.quickActionCard, styles.quickSaleCard]} onPress={() => openQuickAdd('recette')}>
                <View style={[styles.quickIconCircle, { backgroundColor: palette.green }]}>
                  <MaterialCommunityIcons name="cart-outline" size={29} color="#FFFFFF" />
                </View>
                <Ionicons name="chevron-forward" size={22} color={palette.green} style={styles.quickChevron} />
                <View style={styles.quickActionCopy}>
                  <Text numberOfLines={1} style={styles.quickActionTitle}>Nouvelle vente</Text>
                  <Text numberOfLines={2} style={styles.quickActionText}>Ajouter une commande ou un encaissement</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.88} style={[styles.quickActionCard, styles.quickExpenseCard]} onPress={() => openQuickAdd('depense')}>
                <View style={[styles.quickIconCircle, { backgroundColor: palette.blue }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={28} color="#FFFFFF" />
                </View>
                <Ionicons name="chevron-forward" size={22} color={palette.blue} style={styles.quickChevron} />
                <View style={styles.quickActionCopy}>
                  <Text numberOfLines={1} style={styles.quickActionTitle}>Nouvelle dépense</Text>
                  <Text numberOfLines={2} style={styles.quickActionText}>Enregistrer une sortie d’argent</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.attentionCard, compact && styles.attentionCardCompact, { borderColor: `${attention.color}24` }]}>
              <View style={[styles.attentionIconWrap, { backgroundColor: `${attention.color}12` }]}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color={attention.color} />
              </View>
              <View style={styles.attentionCopy}>
                <Text style={styles.attentionTitle}>{attention.title}</Text>
                <Text style={styles.attentionText} numberOfLines={2}>{attention.text}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.82}
                style={[styles.attentionButton, compact && styles.attentionButtonCompact]}
                onPress={() => {
                  if (attention.tx) setSelectedTransaction(attention.tx);
                  else openQuickAdd('recette');
                }}
              >
                <Text numberOfLines={1} style={styles.attentionButtonText}>Voir les détails</Text>
                <Ionicons name="chevron-forward" size={17} color="#B96515" />
              </TouchableOpacity>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Ce qui a bougé</Text>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.viewAllButton}
                onPress={() => {
                  setPeriod('all');
                  setPeriodMenuVisible(false);
                }}
              >
                <Text style={styles.viewAllText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={19} color={palette.blue} />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <TouchableOpacity activeOpacity={0.86} style={styles.emptyMovements} onPress={() => openQuickAdd('recette')}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bag-handle-outline" size={25} color={palette.blue} />
            </View>
            <Text style={styles.emptyTitle}>Aucun mouvement</Text>
            <Text style={styles.emptyText}>Ajoutez une vente ou une dépense pour alimenter cette période.</Text>
          </TouchableOpacity>
        }
        ListFooterComponent={<View style={styles.footerSpace} />}
      />

      <QuickTransactionModal
        visible={modalVisible}
        initialType={quickType}
        onClose={() => setModalVisible(false)}
        onSaved={setLastSaved}
      />

      <TransactionPreviewSheet
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </SafeAreaView>
  );
}

function SparkLine({ series, color, width = 86 }: { series: number[]; color: string; width?: number }) {
  const chartWidth = Math.max(52, width);

  return (
    <Svg width={chartWidth} height={32} viewBox={`0 0 ${chartWidth} 32`} style={styles.chartSvg}>
      <Path d={`M2 28 H${chartWidth - 2}`} stroke={`${color}1A`} strokeWidth={2} strokeLinecap="round" />
      <Path d={buildSparkPath(series, chartWidth - 4, 28)} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
      <Circle cx={chartWidth - 2} cy={series.some(Boolean) ? 8 : 26} r={2.5} fill={color} />
    </Svg>
  );
}

function MiniBars({ series, color, width = 86 }: { series: number[]; color: string; width?: number }) {
  const chartWidth = Math.max(52, width);
  const max = Math.max(...series, 1);
  const slot = chartWidth / Math.max(series.length, 1);
  const barWidth = Math.max(5, Math.min(7, slot * 0.56));

  return (
    <Svg width={chartWidth} height={34} viewBox={`0 0 ${chartWidth} 34`} style={styles.chartSvg}>
      {series.map((value, index) => {
        const height = value === 0 ? 6 : Math.max(8, (value / max) * 28);
        return (
          <Rect
            key={`${value}-${index}`}
            x={index * slot + (slot - barWidth) / 2}
            y={32 - height}
            width={barWidth}
            height={height}
            rx={3.5}
            fill={value === 0 ? `${color}24` : color}
            opacity={value === 0 ? 0.72 : 1}
          />
        );
      })}
    </Svg>
  );
}

function HeroIllustration({ color, compact, positive }: { color: string; compact: boolean; positive: boolean }) {
  const chartPath = positive
    ? 'M8 76 C24 70 34 58 48 58 C62 58 66 36 82 34 C96 32 104 18 118 14'
    : 'M8 16 C24 24 34 38 48 36 C62 34 68 58 82 62 C96 66 104 80 118 86';

  return (
    <View style={[styles.heroVisual, compact && styles.heroVisualCompact]}>
      <View style={[styles.visualBlob, { backgroundColor: `${color}10` }]} />
      <View style={styles.shopShadow} />
      <View style={styles.shopBody}>
        <View style={styles.shopAwning}>
          <View style={[styles.awningStripe, { backgroundColor: color }]} />
          <View style={styles.awningStripe} />
          <View style={[styles.awningStripe, { backgroundColor: color }]} />
          <View style={styles.awningStripe} />
        </View>
        <View style={styles.shopWindows}>
          <View style={styles.shopWindow} />
          <View style={styles.shopDoor} />
          <View style={styles.shopWindow} />
        </View>
      </View>
      <View style={styles.walletCard}>
        <MaterialCommunityIcons name="wallet-outline" size={25} color="#FFFFFF" />
      </View>
      <View style={styles.cartBubble}>
        <MaterialCommunityIcons name="cart-outline" size={24} color={palette.ink} />
      </View>
      <View style={[styles.coin, styles.coinOne]} />
      <View style={[styles.coin, styles.coinTwo]} />
      <Svg width={132} height={98} viewBox="0 0 132 98" style={styles.heroArrow}>
        <Path d={chartPath} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        <Path
          d={positive ? 'M110 12 L121 13 L116 24' : 'M110 86 L121 87 L114 77'}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function TransactionPreviewSheet({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  if (!transaction) return null;

  const isRecette = transaction.type === 'recette';
  const color = isRecette ? palette.green : palette.red;
  const fields = [
    { label: 'Date', value: formatFullDate(transaction.date), icon: 'calendar-outline' as IoniconName },
    { label: 'Paiement', value: getPaymentMode(transaction.modePaiement), icon: 'card-outline' as IoniconName },
    { label: 'Catégorie', value: getTransactionCategoryLabel(transaction.categorie), icon: 'pricetag-outline' as IoniconName },
    transaction.client ? { label: 'Client', value: transaction.client, icon: 'person-outline' as IoniconName } : null,
    transaction.quantite ? { label: 'Quantité', value: String(transaction.quantite), icon: 'calculator-outline' as IoniconName } : null,
    transaction.prixUnitaire ? { label: 'Prix unitaire', value: formatFCFA(transaction.prixUnitaire), icon: 'cash-outline' as IoniconName } : null,
  ].filter(Boolean) as { label: string; value: string; icon: IoniconName }[];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.previewOverlay}>
        <View style={styles.previewSheet}>
          <View style={styles.previewHandle} />

          <View style={styles.previewHeader}>
            <View style={[styles.previewIcon, { backgroundColor: isRecette ? palette.greenSoft : palette.redSoft }]}>
              <Ionicons name={getCategoryIcon(transaction.categorie, isRecette)} size={23} color={color} />
            </View>
            <View style={styles.previewTitleBlock}>
              <Text style={styles.previewTitle}>{getMovementTitle(transaction)}</Text>
              <Text style={styles.previewSubtitle}>{isRecette ? 'Entrée enregistrée' : 'Sortie enregistrée'}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" style={styles.previewClose} onPress={onClose}>
              <Ionicons name="close" size={22} color={palette.muted} />
            </TouchableOpacity>
          </View>

          <Text adjustsFontSizeToFit minimumFontScale={0.76} numberOfLines={1} style={[styles.previewAmount, { color }]}>
            {isRecette ? '+' : '-'}{formatShortFCFA(transaction.montant)}
          </Text>

          <View style={styles.previewGrid}>
            {fields.map(field => (
              <View key={field.label} style={styles.previewField}>
                <Ionicons name={field.icon} size={16} color={palette.softText} />
                <View style={styles.previewFieldCopy}>
                  <Text style={styles.previewFieldLabel}>{field.label}</Text>
                  <Text style={styles.previewFieldValue}>{field.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {transaction.notes ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Note</Text>
              <Text style={styles.noteText}>{transaction.notes}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.background,
    flex: 1,
  },
  listContent: {
    paddingBottom: 112,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  listContentCompact: {
    paddingHorizontal: 12,
  },
  contentTop: {
    gap: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerCompact: {
    gap: 8,
  },
  menuButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 36,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 32,
  },
  headerSubtitle: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  dateButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    marginTop: 5,
  },
  dateText: {
    color: palette.blue,
    fontSize: 14,
    fontWeight: '900',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  bellButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    position: 'relative',
    width: 34,
  },
  bellDot: {
    backgroundColor: palette.red,
    borderColor: palette.background,
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    right: 2,
    top: 4,
    width: 12,
  },
  avatar: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  periodRow: {
    gap: 8,
    paddingRight: 12,
  },
  periodChip: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  periodChipText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  periodChipTextActive: {
    color: '#FFFFFF',
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 260,
    overflow: 'hidden',
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 5,
  },
  heroCardCompact: {
    minHeight: 232,
    padding: 14,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  heroCopyCompact: {
    paddingRight: 4,
  },
  statusPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusPillCompact: {
    gap: 5,
    maxWidth: 178,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  heroTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 27,
    marginTop: 18,
  },
  heroAmount: {
    fontSize: 33,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 40,
    marginTop: 14,
  },
  trendChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '900',
  },
  heroButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 7,
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  heroButtonCompact: {
    minHeight: 42,
    paddingHorizontal: 12,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  heroVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
    position: 'relative',
    width: 148,
  },
  heroVisualCompact: {
    marginRight: -24,
    transform: [{ scale: 0.82 }],
    width: 112,
  },
  visualBlob: {
    borderRadius: 56,
    height: 116,
    position: 'absolute',
    right: 4,
    top: 40,
    transform: [{ rotate: '-8deg' }],
    width: 126,
  },
  shopShadow: {
    backgroundColor: 'rgba(15,23,42,0.14)',
    borderRadius: 999,
    bottom: 48,
    height: 14,
    position: 'absolute',
    right: 24,
    width: 96,
  },
  shopBody: {
    backgroundColor: '#28313E',
    borderRadius: 10,
    bottom: 58,
    height: 76,
    position: 'absolute',
    right: 26,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    width: 96,
    elevation: 8,
  },
  shopAwning: {
    flexDirection: 'row',
    height: 25,
    overflow: 'hidden',
  },
  awningStripe: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  shopWindows: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingTop: 9,
  },
  shopWindow: {
    backgroundColor: '#3E7190',
    borderRadius: 4,
    height: 30,
    width: 22,
  },
  shopDoor: {
    backgroundColor: '#18212D',
    borderRadius: 5,
    height: 38,
    width: 22,
  },
  walletCard: {
    alignItems: 'center',
    backgroundColor: '#2A2D35',
    borderRadius: 10,
    bottom: 42,
    height: 48,
    justifyContent: 'center',
    left: 3,
    position: 'absolute',
    width: 58,
  },
  cartBubble: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    bottom: 43,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 48,
  },
  coin: {
    backgroundColor: '#FDBA31',
    borderColor: '#F59E0B',
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    position: 'absolute',
    width: 18,
  },
  coinOne: {
    bottom: 40,
    left: 3,
  },
  coinTwo: {
    bottom: 35,
    right: 37,
  },
  heroArrow: {
    position: 'absolute',
    right: 4,
    top: 26,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricsRowCompact: {
    gap: 7,
  },
  metricCard: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 172,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  metricCardCompact: {
    minHeight: 150,
    padding: 9,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 39,
    justifyContent: 'center',
    width: 39,
  },
  metricIconCompact: {
    borderRadius: 15,
    height: 34,
    width: 34,
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 9,
  },
  metricDetail: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 7,
  },
  chartSvg: {
    marginTop: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 10,
    minHeight: 126,
    padding: 14,
    position: 'relative',
  },
  quickSaleCard: {
    backgroundColor: '#F1FFF9',
    borderColor: '#CFF8E8',
  },
  quickExpenseCard: {
    backgroundColor: '#F3F8FF',
    borderColor: '#D8E9FF',
  },
  quickIconCircle: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  quickChevron: {
    position: 'absolute',
    right: 12,
    top: 20,
  },
  quickActionCopy: {
    alignSelf: 'stretch',
    minWidth: 0,
    paddingRight: 4,
  },
  quickActionTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  quickActionText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 4,
  },
  attentionCard: {
    alignItems: 'center',
    backgroundColor: '#FFF8EF',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 104,
    padding: 14,
  },
  attentionCardCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: 10,
  },
  attentionIconWrap: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  attentionCopy: {
    flex: 1,
    minWidth: 0,
  },
  attentionTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  attentionText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
  },
  attentionButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#F6D9B6',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 44,
    paddingHorizontal: 13,
  },
  attentionButtonCompact: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  attentionButtonText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  viewAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  viewAllText: {
    color: palette.blue,
    fontSize: 14,
    fontWeight: '900',
  },
  movementRow: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    flexDirection: 'row',
    gap: 14,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  movementRowCompact: {
    gap: 10,
    paddingHorizontal: 12,
  },
  movementRowFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  movementRowLast: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  movementRowBorder: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
  },
  movementIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  movementCopy: {
    flex: 1,
    minWidth: 0,
  },
  movementTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  movementMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  movementAmountWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    maxWidth: 134,
  },
  movementAmountWrapCompact: {
    gap: 5,
    maxWidth: 112,
  },
  movementAmount: {
    fontSize: 13,
    fontWeight: '900',
    maxWidth: 106,
  },
  emptyMovements: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 1,
    gap: 7,
    padding: 22,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: palette.blueSoft,
    borderRadius: 22,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  footerSpace: {
    height: 20,
  },
  previewOverlay: {
    backgroundColor: 'rgba(9, 18, 59, 0.46)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  previewSheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 16,
    padding: 18,
  },
  previewHandle: {
    alignSelf: 'center',
    backgroundColor: palette.line,
    borderRadius: 999,
    height: 4,
    width: 42,
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  previewIcon: {
    alignItems: 'center',
    borderRadius: 15,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  previewTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  previewSubtitle: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  previewClose: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  previewAmount: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
  },
  previewGrid: {
    gap: 9,
  },
  previewField: {
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderColor: palette.line,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 49,
    paddingHorizontal: 12,
  },
  previewFieldCopy: {
    flex: 1,
    minWidth: 0,
  },
  previewFieldLabel: {
    color: palette.softText,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  previewFieldValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  noteBox: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 12,
  },
  noteLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  noteText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
