import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps?: number; // Defaults to 5
  onBack?: () => void;
}

export default function ProgressHeader({ currentStep, totalSteps = 5, onBack }: ProgressHeaderProps) {
  const handleBack = onBack || (() => router.back());
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Custom Circular Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={20} color="#0C1A30" />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          return (
            <View
              key={index}
              style={[
                styles.segment,
                isActive ? styles.segmentActive : styles.segmentInactive,
              ]}
            />
          );
        })}
      </View>

      {/* Spacer to balance the back button */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    paddingHorizontal: 16,
  },
  segment: {
    height: 6,
    borderRadius: 3,
    flex: 1,
    maxWidth: 40,
  },
  segmentActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentInactive: {
    backgroundColor: '#E2E8F0',
  },
  spacer: {
    width: 40, // Match backButton width
  },
});
