import React, { useEffect, useMemo, useState } from 'react';
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
import { api } from '../../src/core/api/apiClient';
import { GLOSSAIRE } from '../../src/shared/utils/glossaire';
import { getPilotageConfig } from '../../src/shared/utils/pilotage';
import { theme } from '../../src/theme';

interface GlossaireEntry {
  id: string;
  terme: string;
  definition: string;
  exemple?: string;
  formule?: string;
}

interface FichePedagogique {
  id: string;
  titre: string;
  contenu: string;
  exemple?: string;
  categorie?: string;
}

type LibraryMode = 'glossaire' | 'fiches';

export default function AcademieScreen() {
  const profile = useProfileStore(s => s.profile);
  const config = useProfileConfigStore(s => s.config);
  const [glossaire, setGlossaire] = useState<GlossaireEntry[]>([]);
  const [fiches, setFiches] = useState<FichePedagogique[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'synced' | 'fallback'>('synced');
  const [libraryMode, setLibraryMode] = useState<LibraryMode | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<GlossaireEntry | null>(null);
  const [selectedFiche, setSelectedFiche] = useState<FichePedagogique | null>(null);

  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: config?.economicUnit,
  });

  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      setLoading(true);
      try {
        const [glossaireRes, fichesRes] = await Promise.allSettled([
          api.getGlossaire(),
          api.getFichesPedagogiques(),
        ]);

        if (!mounted) return;

        if (glossaireRes.status === 'fulfilled') {
          setGlossaire(glossaireRes.value.data as GlossaireEntry[]);
          setSource('synced');
        } else {
          setGlossaire(GLOSSAIRE as unknown as GlossaireEntry[]);
          setSource('fallback');
        }

        if (fichesRes.status === 'fulfilled') {
          setFiches(fichesRes.value.data as FichePedagogique[]);
        }
      } catch {
        if (mounted) {
          setGlossaire(GLOSSAIRE as unknown as GlossaireEntry[]);
          setSource('fallback');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  const modules = useMemo(() => [
    {
      id: 'glossaire' as const,
      title: 'Glossaire financier',
      subtitle: `${glossaire.length} notion${glossaire.length > 1 ? 's' : ''} pour lire vos chiffres`,
      icon: 'book-outline' as const,
      color: pilotage.primaryColor,
      available: glossaire.length > 0,
      action: () => setLibraryMode('glossaire'),
    },
    {
      id: 'fiches' as const,
      title: 'Fiches pratiques',
      subtitle: fiches.length > 0 ? `${fiches.length} fiche${fiches.length > 1 ? 's' : ''} disponible${fiches.length > 1 ? 's' : ''}` : 'De nouvelles fiches apparaîtront ici dès qu’elles seront disponibles',
      icon: 'reader-outline' as const,
      color: theme.colors.warning,
      available: fiches.length > 0,
      action: () => setLibraryMode('fiches'),
    },
    {
      id: 'expert' as const,
      title: 'Préparer un échange expert',
      subtitle: config?.features.showExpertAssistance ? 'Disponible selon vos déclencheurs métier' : 'Contextuel selon votre mode',
      icon: 'shield-checkmark-outline' as const,
      color: theme.colors.success,
      available: Boolean(config?.features.showExpertAssistance),
      action: () => Alert.alert('Assistance contextuelle', 'L’expert apparaît depuis les écrans où vos données le justifient.'),
    },
  ], [config?.features.showExpertAssistance, fiches.length, glossaire.length, pilotage.primaryColor]);

  const closeLibrary = () => setLibraryMode(null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader title="Académie" subtitle={pilotage.accountingLabel} showSettings={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageIntro
          eyebrow="Comprendre"
          title="Académie C’PRO"
          subtitle="Des notions courtes pour mieux lire vos chiffres et préparer vos décisions."
          icon="school-outline"
          color={pilotage.primaryColor}
        />

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={pilotage.primaryColor} />
            <Text style={styles.loadingText}>Chargement des contenus...</Text>
          </View>
        ) : source === 'fallback' ? (
          <InfoBanner
            icon="cloud-offline-outline"
            title="Contenu disponible hors connexion"
            text="Les notions essentielles restent accessibles pendant la mise à jour."
            color={theme.colors.warning}
          />
        ) : (
          <InfoBanner
            icon="checkmark-circle-outline"
            title="Contenu à jour"
            text="Les notions et fiches disponibles sont prêtes."
            color={theme.colors.success}
          />
        )}

        <SectionHeader title="Bibliothèque" />

        <View style={styles.moduleList}>
          {modules.map(module => (
            <TouchableOpacity
              key={module.id}
              activeOpacity={0.85}
              disabled={!module.available && module.id !== 'expert'}
              onPress={module.action}
            >
              <StitchCard style={[styles.moduleCard, !module.available && styles.moduleMuted]}>
                <View style={[styles.moduleIcon, { backgroundColor: `${module.color}18` }]}>
                  <Ionicons name={module.icon} size={22} color={module.color} />
                </View>
                <View style={styles.moduleCopy}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
                </View>
                <Ionicons name={module.available ? 'chevron-forward' : 'lock-closed-outline'} size={18} color={theme.colors.textLight} />
              </StitchCard>
            </TouchableOpacity>
          ))}
        </View>

        {!loading && glossaire.length === 0 && fiches.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title="Aucun contenu disponible"
            text="Les contenus pédagogiques apparaîtront ici dès qu’ils seront disponibles."
            color={pilotage.primaryColor}
          />
        ) : null}
      </ScrollView>

      <Modal visible={libraryMode === 'glossaire'} animationType="slide" transparent onRequestClose={closeLibrary}>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <SheetHeader title="Glossaire financier" onClose={closeLibrary} />
            <ScrollView contentContainerStyle={styles.sheetScroll}>
              {glossaire.map(entry => (
                <TouchableOpacity key={entry.id} activeOpacity={0.85} style={styles.contentRow} onPress={() => setSelectedEntry(entry)}>
                  <Text style={styles.contentTitle}>{entry.terme}</Text>
                  <Text style={styles.contentText} numberOfLines={2}>{entry.definition}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={libraryMode === 'fiches'} animationType="slide" transparent onRequestClose={closeLibrary}>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <SheetHeader title="Fiches pratiques" onClose={closeLibrary} />
            <ScrollView contentContainerStyle={styles.sheetScroll}>
              {fiches.length === 0 ? (
                <EmptyState
                  icon="reader-outline"
                  title="Fiches à venir"
                  text="Aucune fiche disponible pour le moment."
                  color={theme.colors.warning}
                />
              ) : fiches.map(fiche => (
                <TouchableOpacity key={fiche.id} activeOpacity={0.85} style={styles.contentRow} onPress={() => setSelectedFiche(fiche)}>
                  {fiche.categorie ? <Text style={styles.contentEyebrow}>{fiche.categorie}</Text> : null}
                  <Text style={styles.contentTitle}>{fiche.titre}</Text>
                  <Text style={styles.contentText} numberOfLines={2}>{fiche.contenu}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <DetailModal
        visible={Boolean(selectedEntry)}
        title={selectedEntry?.terme}
        sections={selectedEntry ? [
          { label: 'Définition', value: selectedEntry.definition },
          { label: 'Exemple', value: selectedEntry.exemple },
          { label: 'Formule', value: selectedEntry.formule },
        ] : []}
        onClose={() => setSelectedEntry(null)}
      />

      <DetailModal
        visible={Boolean(selectedFiche)}
        title={selectedFiche?.titre}
        sections={selectedFiche ? [
          { label: selectedFiche.categorie ?? 'Contenu', value: selectedFiche.contenu },
          { label: 'Exemple', value: selectedFiche.exemple },
        ] : []}
        onClose={() => setSelectedFiche(null)}
      />
    </SafeAreaView>
  );
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.sheetHeader}>
      <Text style={styles.sheetTitle}>{title}</Text>
      <TouchableOpacity accessibilityRole="button" style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

function DetailModal({
  visible,
  title,
  sections,
  onClose,
}: {
  visible: boolean;
  title?: string;
  sections: { label: string; value?: string }[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.sheet}>
          <SheetHeader title={title ?? 'Détail'} onClose={onClose} />
          <ScrollView contentContainerStyle={styles.detailScroll}>
            {sections.filter(section => section.value).map(section => (
              <View key={section.label} style={styles.detailBlock}>
                <Text style={styles.detailLabel}>{section.label}</Text>
                <Text style={styles.detailText}>{section.value}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
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
  moduleList: { gap: theme.spacing.sm },
  moduleCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  moduleMuted: { opacity: 0.64 },
  moduleIcon: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  moduleCopy: { flex: 1 },
  moduleTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  moduleSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  modalOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    maxHeight: '84%',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  sheetHeader: {
    alignItems: 'center',
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  sheetTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sheetScroll: { gap: theme.spacing.sm, paddingVertical: theme.spacing.md },
  contentRow: {
    backgroundColor: theme.colors.surfaceLow,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  contentEyebrow: {
    ...theme.typography.label,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  contentTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
  },
  contentText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  detailScroll: { gap: theme.spacing.md, paddingVertical: theme.spacing.md },
  detailBlock: { gap: theme.spacing.xs },
  detailLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  detailText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
});
