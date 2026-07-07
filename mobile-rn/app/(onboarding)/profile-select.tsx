import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProgressHeader from '../../src/shared/components/ProgressHeader';
import { getOnboardingUnitGroups } from '../../src/shared/utils/pilotage';
import { api } from '../../src/core/api/apiClient';
import { theme } from '../../src/theme';
import type { ProfileDashboardConfig } from '../../src/types';

type MetiersByProfilResponse = Record<string, (ProfileDashboardConfig | null)[]>;

export default function ProfileSelectScreen() {
  const [remoteConfigs, setRemoteConfigs] = useState<ProfileDashboardConfig[]>([]);
  const groups = useMemo(() => getOnboardingUnitGroups(remoteConfigs), [remoteConfigs]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedGroup = groups.find(group => group.id === selectedGroupId) ?? null;

  useEffect(() => {
    let mounted = true;
    api.getMetiersDashboardConfigs()
      .then(res => {
        const payload = res.data as MetiersByProfilResponse;
        const configs = Object.values(payload).flat().filter(Boolean) as ProfileDashboardConfig[];
        if (mounted && configs.length > 0) setRemoteConfigs(configs);
      })
      .catch(() => {
        // Fallback groups keep onboarding usable offline.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleContinue = () => {
    if (!selectedGroupId) {
      setError('Choisissez d’abord ce que vous pilotez au quotidien.');
      return;
    }
    if (!selectedSlug) {
      setError('Choisissez ensuite votre activité précise.');
      return;
    }

    setError(null);
    router.push({
      pathname: '/(onboarding)/plan-recommend',
      params: { metier: selectedSlug },
    });
  };

  return (
    <SafeAreaWrapper>
      <ProgressHeader currentStep={4} onBack={() => router.replace('/(auth)/welcome')} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Votre activité</Text>
          <Text style={styles.title}>Qu’est-ce que vous pilotez chaque jour ?</Text>
          <Text style={styles.subtitle}>
            C’PRO adapte les écrans, les alertes et la saisie autour de votre unité économique réelle.
          </Text>
        </View>

        <View style={styles.unitList}>
          {groups.map(group => {
            const selected = selectedGroupId === group.id;
            return (
              <TouchableOpacity
                key={group.id}
                activeOpacity={0.85}
                style={[styles.unitCard, selected && { borderColor: group.color, backgroundColor: `${group.color}10` }]}
                onPress={() => {
                  setSelectedGroupId(group.id);
                  setSelectedSlug(null);
                  setError(null);
                }}
              >
                <View style={[styles.unitIcon, { backgroundColor: `${group.color}18` }]}> 
                  <Text style={styles.unitEmoji}>{group.icon}</Text>
                </View>
                <View style={styles.unitText}>
                  <Text style={styles.unitTitle}>{group.unitLabel}</Text>
                  <Text style={styles.unitQuestion}>“{group.question}”</Text>
                  <Text style={styles.unitExamples}>→ {group.examples}</Text>
                </View>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'chevron-forward'}
                  size={22}
                  color={selected ? group.color : '#94A3B8'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedGroup && (
          <View style={styles.metierSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Activité précise</Text>
              <Text style={[styles.sectionHint, { color: selectedGroup.color }]}>2e choix</Text>
            </View>
            <View style={styles.metierGrid}>
              {selectedGroup.metiers.map(metier => {
                const selected = selectedSlug === metier.slug;
                return (
                  <TouchableOpacity
                    key={metier.slug}
                    activeOpacity={0.85}
                    style={[styles.metierPill, selected && { borderColor: selectedGroup.color, backgroundColor: `${selectedGroup.color}12` }]}
                    onPress={() => {
                      setSelectedSlug(metier.slug);
                      setError(null);
                    }}
                  >
                    <Text style={styles.metierIcon}>{metier.icon}</Text>
                    <Text style={[styles.metierLabel, selected && { color: selectedGroup.color }]} numberOfLines={2}>
                      {metier.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="options" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Ce choix configure le pilotage</Text>
            <Text style={styles.infoDesc}>
              Les libellés, la couleur du bouton principal, l’analyse et les actions rapides suivront ce que vous pilotez.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            selectedGroup && { backgroundColor: selectedGroup.color, shadowColor: selectedGroup.color },
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continuer</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>{children}</View>;
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0C1A30',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  unitList: {
    gap: 12,
  },
  unitCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  unitIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  unitEmoji: {
    fontSize: 24,
  },
  unitText: {
    flex: 1,
  },
  unitTitle: {
    color: '#0C1A30',
    fontSize: 15,
    fontWeight: '900',
  },
  unitQuestion: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  unitExamples: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  metierSection: {
    marginTop: 22,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0C1A30',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHint: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metierPill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '48%',
  },
  metierIcon: {
    fontSize: 18,
  },
  metierLabel: {
    color: '#0C1A30',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 16,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    borderColor: '#E0EBFF',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    padding: 16,
  },
  infoIconContainer: {
    alignItems: 'center',
    backgroundColor: '#E0EBFF',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#0C1A30',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 2,
  },
  infoDesc: {
    color: '#475569',
    fontSize: 11,
    lineHeight: 15,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    gap: 8,
    height: 52,
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
