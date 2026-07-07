import React from 'react';
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
import { useProfileStore } from '../../src/shared/hooks/useProfile';
import { useProfileConfigStore } from '../../src/shared/hooks/useProfileConfig';
import { useTransactionStore } from '../../src/shared/hooks/useTransactions';
import { getPilotageConfig } from '../../src/shared/utils/pilotage';
import { theme } from '../../src/theme';

const DOCUMENT_TYPES = [
  {
    icon: 'document-text-outline' as const,
    title: 'Résumé mensuel',
    desc: 'Entrées, sorties, résultat net et volume d’activité sur la période.',
    action: 'Générer',
  },
  {
    icon: 'receipt-outline' as const,
    title: 'Export des transactions',
    desc: 'Historique détaillé exploitable pour suivi, contrôle ou partage.',
    action: 'Exporter',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Preuve de revenus',
    desc: 'Attestation préparée depuis les opérations enregistrées dans C’PRO.',
    action: 'Préparer',
  },
  {
    icon: 'folder-open-outline' as const,
    title: 'Dossier financement',
    desc: 'Pièces utiles pour prêt, subvention ou échange avec une IMF.',
    action: 'Assembler',
  },
];

export default function DocumentsScreen() {
  const transactions = useTransactionStore(s => s.transactions);
  const profile = useProfileStore(s => s.profile);
  const config = useProfileConfigStore(s => s.config);
  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: config?.economicUnit,
  });

  const hasEnoughData = transactions.length >= 3;
  const documentsEnabled = config?.features.showDocumentsModule ?? true;
  const canGenerate = hasEnoughData && documentsEnabled;

  const handleAction = (title: string) => {
    if (!documentsEnabled) {
      Alert.alert('Document indisponible', 'Ce document dépend du mode de pilotage configuré pour votre activité.');
      return;
    }
    if (!hasEnoughData) {
      Alert.alert('Données insuffisantes', 'Ajoutez au moins 3 transactions dans votre journal pour générer ce document.');
      return;
    }
    Alert.alert(title, 'C’PRO préparera ce document à partir de vos opérations enregistrées.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader title="Documents" subtitle={pilotage.accountingLabel} showSettings={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageIntro
          eyebrow={config?.subscription.currentPlan.label ?? 'C’PRO'}
          title="Documents utiles"
          subtitle="Générez des pièces lisibles à partir des données déjà enregistrées dans votre journal."
          icon="folder-outline"
          color={pilotage.primaryColor}
        />

        {!documentsEnabled ? (
          <InfoBanner
            icon="lock-closed-outline"
            title="Documents désactivés pour ce mode"
            text="La disponibilité dépend du mode prévu pour votre activité."
            color={theme.colors.warning}
          />
        ) : !hasEnoughData ? (
          <InfoBanner
            icon="document-text-outline"
            title="Encore quelques données"
            text={`Ajoutez ${3 - transactions.length} opération${3 - transactions.length > 1 ? 's' : ''} pour générer des documents crédibles.`}
            color={pilotage.primaryColor}
          />
        ) : (
          <InfoBanner
            icon="checkmark-circle-outline"
            title="Prêt à générer"
            text={`${transactions.length} opérations sont disponibles pour alimenter vos documents.`}
            color={theme.colors.success}
          />
        )}

        <SectionHeader title="Documents disponibles" />

        <View style={styles.list}>
          {DOCUMENT_TYPES.map((doc, index) => (
            <StitchCard key={doc.title} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={[styles.iconBox, { backgroundColor: `${pilotage.primaryColor}18` }]}>
                  <Ionicons name={doc.icon} size={22} color={pilotage.primaryColor} />
                </View>
                <View style={styles.documentCopy}>
                  <Text style={styles.documentTitle}>{doc.title}</Text>
                  <Text style={styles.documentDesc}>{doc.desc}</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!canGenerate}
                onPress={() => handleAction(doc.title)}
                style={[
                  styles.actionButton,
                  index === 0 ? { backgroundColor: pilotage.primaryColor, borderColor: pilotage.primaryColor } : null,
                  !canGenerate ? styles.actionButtonDisabled : null,
                ]}
              >
                <Ionicons
                  name={doc.action === 'Exporter' ? 'download-outline' : 'arrow-forward'}
                  size={17}
                  color={index === 0 ? '#FFFFFF' : pilotage.primaryColor}
                />
                <Text style={[styles.actionText, index === 0 ? styles.actionTextPrimary : { color: pilotage.primaryColor }]}>
                  {doc.action}
                </Text>
              </TouchableOpacity>
            </StitchCard>
          ))}
        </View>

        {transactions.length === 0 && (
          <EmptyState
            icon="receipt-outline"
            title="Aucune opération"
            text="Le journal est la source des documents C’PRO. Ajoutez vos premières recettes ou dépenses pour commencer."
            color={pilotage.primaryColor}
          />
        )}

        <TouchableOpacity style={styles.secondaryLink} onPress={() => router.push('/(tabs)/journal')}>
          <Text style={[styles.secondaryLinkText, { color: pilotage.primaryColor }]}>Ouvrir le journal</Text>
          <Ionicons name="arrow-forward" size={16} color={pilotage.primaryColor} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { gap: theme.spacing.md, padding: theme.spacing.md, paddingBottom: 48 },
  list: { gap: theme.spacing.sm },
  documentCard: { gap: theme.spacing.md },
  documentHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  documentCopy: { flex: 1 },
  documentTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  documentDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  actionButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 40,
    paddingHorizontal: theme.spacing.md,
  },
  actionButtonDisabled: { opacity: 0.45 },
  actionText: {
    ...theme.typography.caption,
    fontWeight: '800',
  },
  actionTextPrimary: { color: '#FFFFFF' },
  secondaryLink: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    minHeight: 44,
  },
  secondaryLinkText: {
    ...theme.typography.caption,
    fontWeight: '800',
  },
});
