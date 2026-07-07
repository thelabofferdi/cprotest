import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import ProgressHeader from '../../src/shared/components/ProgressHeader';
import {
  InfoBanner,
  PageIntro,
  SectionHeader,
  StitchCard,
} from '../../src/shared/components/StitchPrimitives';
import { getOnboardingUnitGroups, getPilotageConfig } from '../../src/shared/utils/pilotage';
import { theme } from '../../src/theme';

interface SelectOption {
  id: string;
  label: string;
  icon?: string;
}

const LOCATIONS: SelectOption[] = [
  { label: 'Abomey-Calavi, Bénin', id: 'BJ-AC' },
  { label: 'Cotonou, Bénin', id: 'BJ-COT' },
  { label: 'Porto-Novo, Bénin', id: 'BJ-PN' },
  { label: 'Parakou, Bénin', id: 'BJ-PAR' },
  { label: 'Abidjan, Côte d’Ivoire', id: 'CI-ABJ' },
  { label: 'Bouaké, Côte d’Ivoire', id: 'CI-BOU' },
  { label: 'Yamoussoukro, Côte d’Ivoire', id: 'CI-YAM' },
  { label: 'Lomé, Togo', id: 'TG-LOM' },
];

const STATUTS: SelectOption[] = [
  { label: 'Entrepreneur individuel', id: 'EI' },
  { label: 'SARL', id: 'SARL' },
  { label: 'SAS', id: 'SAS' },
  { label: 'Coopérative', id: 'COOP' },
  { label: 'Association', id: 'ASSOC' },
];

export default function WorkspaceSetupScreen() {
  const { metier } = useLocalSearchParams<{ metier?: string }>();
  const metiers = useMemo<SelectOption[]>(() => {
    return getOnboardingUnitGroups()
      .flatMap(group => group.metiers)
      .map(item => ({ id: item.slug, label: item.label, icon: item.icon }));
  }, []);

  const [selectedMetier, setSelectedMetier] = useState<SelectOption | null>(
    metier ? metiers.find(item => item.id === metier) ?? null : null,
  );
  const [selectedLocation, setSelectedLocation] = useState<SelectOption | null>(null);
  const [structureName, setStructureName] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<SelectOption | null>(null);
  const [selector, setSelector] = useState<'metier' | 'location' | 'statut' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pilotage = getPilotageConfig({ metier: selectedMetier?.id ?? metier });

  const handleContinue = () => {
    if (!selectedMetier || !selectedLocation || !structureName.trim() || !selectedStatut) {
      setError('Renseignez l’activité, la localisation, le nom et le statut pour continuer.');
      return;
    }

    setError(null);
    router.push({
      pathname: '/(onboarding)/recap',
      params: {
        metierSlug: selectedMetier.id,
        metierLabel: selectedMetier.label,
        location: selectedLocation.label,
        structureName: structureName.trim(),
        statut: selectedStatut.label,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ProgressHeader currentStep={4} onBack={() => router.back()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <PageIntro
            eyebrow="Espace de travail"
            title="Vos informations d’activité"
            subtitle="Ces informations personnalisent votre espace C’PRO et vos écrans de pilotage."
            icon="business-outline"
            color={pilotage.primaryColor}
          />

          {error ? <InfoBanner icon="alert-circle-outline" title="Champs requis" text={error} color={theme.colors.error} /> : null}

          <SectionHeader title="Activité" />
          <View style={styles.formStack}>
            <SelectField
              icon="briefcase-outline"
              label="Activité principale"
              value={selectedMetier ? `${selectedMetier.icon ?? ''} ${selectedMetier.label}`.trim() : 'Sélectionnez votre activité'}
              selected={Boolean(selectedMetier)}
              color={pilotage.primaryColor}
              onPress={() => setSelector('metier')}
            />

            <FieldCard icon="storefront-outline" label="Nom de votre structure" color={pilotage.primaryColor}>
              <TextInput
                value={structureName}
                onChangeText={setStructureName}
                placeholder="Nom de votre activité"
                placeholderTextColor={theme.colors.textLight}
                style={styles.input}
              />
            </FieldCard>
          </View>

          <SectionHeader title="Coordonnées" />
          <View style={styles.formStack}>
            <SelectField
              icon="location-outline"
              label="Localisation"
              value={selectedLocation?.label ?? 'Ville, commune ou localité'}
              selected={Boolean(selectedLocation)}
              color={pilotage.primaryColor}
              onPress={() => setSelector('location')}
            />
            <SelectField
              icon="shield-checkmark-outline"
              label="Statut juridique"
              value={selectedStatut?.label ?? 'Sélectionnez votre statut'}
              selected={Boolean(selectedStatut)}
              color={pilotage.primaryColor}
              onPress={() => setSelector('statut')}
            />
          </View>

          <InfoBanner
            icon="lock-closed-outline"
            text="Ces informations restent modifiables depuis votre profil."
            color={pilotage.primaryColor}
          />

          <TouchableOpacity activeOpacity={0.88} style={[styles.primaryButton, { backgroundColor: pilotage.primaryColor }]} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionModal
        visible={selector !== null}
        title={selector === 'metier' ? 'Activité principale' : selector === 'location' ? 'Localisation' : 'Statut juridique'}
        options={selector === 'metier' ? metiers : selector === 'location' ? LOCATIONS : STATUTS}
        color={pilotage.primaryColor}
        onClose={() => setSelector(null)}
        onSelect={(option) => {
          if (selector === 'metier') setSelectedMetier(option);
          if (selector === 'location') setSelectedLocation(option);
          if (selector === 'statut') setSelectedStatut(option);
          setError(null);
          setSelector(null);
        }}
      />
    </View>
  );
}

function SelectField({
  icon,
  label,
  value,
  selected,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  selected: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <FieldCard icon={icon} label={label} color={color}>
        <View style={styles.selectValueRow}>
          <Text style={[styles.selectValue, !selected && styles.placeholder]} numberOfLines={1}>{value}</Text>
          <Ionicons name="chevron-down" size={18} color={theme.colors.textLight} />
        </View>
      </FieldCard>
    </TouchableOpacity>
  );
}

function FieldCard({
  icon,
  label,
  color,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <StitchCard style={styles.fieldCard}>
      <View style={[styles.fieldIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.fieldCopy}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {children}
      </View>
    </StitchCard>
  );
}

function OptionModal({
  visible,
  title,
  options,
  color,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: SelectOption[];
  color: string;
  onClose: () => void;
  onSelect: (option: SelectOption) => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.optionList} showsVerticalScrollIndicator={false}>
            {options.map(option => (
              <TouchableOpacity key={option.id} activeOpacity={0.85} style={styles.optionRow} onPress={() => onSelect(option)}>
                <View style={[styles.optionIcon, { backgroundColor: `${color}18` }]}>
                  <Text style={styles.optionEmoji}>{option.icon ?? '•'}</Text>
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 32,
  },
  formStack: {
    gap: theme.spacing.sm,
  },
  fieldCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  fieldIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  fieldCopy: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  selectValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  selectValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '800',
  },
  placeholder: {
    color: theme.colors.textLight,
  },
  input: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '800',
    minHeight: 26,
    padding: 0,
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
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: '78%',
    overflow: 'hidden',
    width: '100%',
  },
  sheetHeader: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sheetTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  closeButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  optionList: {
    padding: theme.spacing.sm,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 48,
    paddingHorizontal: theme.spacing.sm,
  },
  optionIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '800',
  },
});
