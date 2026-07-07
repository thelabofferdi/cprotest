import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { signUp } from '../../src/core/auth/authService';
import { useAuthStore } from '../../src/shared/hooks/useAuth';
import { theme } from '../../src/theme';
import ProgressHeader from '../../src/shared/components/ProgressHeader';

export default function PasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const checkAuth = useAuthStore(s => s.checkAuth);

  // Criteria validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[@#$!%*?&._-]/.test(password);

  const isFormValid = hasMinLength && hasNumber && hasUppercase && hasSpecialChar && password === confirmPassword;

  const handleContinue = async () => {
    if (!isFormValid) {
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
      } else {
        setError('Le mot de passe ne respecte pas tous les critères.');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const emailClean = email ? decodeURIComponent(email).trim().toLowerCase() : '';
      if (!emailClean) {
        throw new Error('Email manquant.');
      }

      await signUp(emailClean, password);
      await checkAuth();

      // Proceed to Step 4: Profile selection screen
      router.replace('/(onboarding)/profile-select');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de création de compte";
      setError(msg || "Impossible d'enregistrer le mot de passe. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ProgressHeader currentStep={3} totalSteps={4} onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Circular Shield Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Ionicons name="shield-half" size={48} color="#0055FF" />
              </View>
              {/* Floating padlock badge */}
              <View style={styles.lockBadge}>
                <Ionicons name="key" size={12} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Sécurisez votre compte</Text>
            <Text style={styles.subtitle}>
              Créez un mot de passe sécurisé pour protéger votre compte.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Password Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmez votre mot de passe"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Criteria Checklist Card */}
            <View style={styles.criteriaCard}>
              <View style={styles.criteriaHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#0055FF" />
                <Text style={styles.criteriaTitle}>Votre mot de passe doit contenir :</Text>
              </View>

              <View style={styles.checklist}>
                {/* 8 characters */}
                <View style={styles.checkRow}>
                  <Ionicons
                    name={hasMinLength ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={hasMinLength ? '#10B981' : '#CBD5E1'}
                  />
                  <Text style={[styles.checkText, hasMinLength && styles.checkTextActive]}>
                    Au moins 8 caractères
                  </Text>
                </View>

                {/* 1 number */}
                <View style={styles.checkRow}>
                  <Ionicons
                    name={hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={hasNumber ? '#10B981' : '#CBD5E1'}
                  />
                  <Text style={[styles.checkText, hasNumber && styles.checkTextActive]}>
                    Au moins 1 chiffre
                  </Text>
                </View>

                {/* 1 uppercase */}
                <View style={styles.checkRow}>
                  <Ionicons
                    name={hasUppercase ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={hasUppercase ? '#10B981' : '#CBD5E1'}
                  />
                  <Text style={[styles.checkText, hasUppercase && styles.checkTextActive]}>
                    Au moins 1 lettre majuscule
                  </Text>
                </View>

                {/* 1 special char */}
                <View style={styles.checkRow}>
                  <Ionicons
                    name={hasSpecialChar ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={hasSpecialChar ? '#10B981' : '#CBD5E1'}
                  />
                  <Text style={[styles.checkText, hasSpecialChar && styles.checkTextActive]}>
                    Au moins 1 caractère spécial (ex : @, #, !)
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, (!isFormValid || loading) && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Continuer</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Secure Payment Footer */}
          <View style={styles.footerContainer}>
            <Ionicons name="lock-closed" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>Paiement 100% sécurisé</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>{children}</View>;
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' },
  illustrationContainer: { marginTop: 20, marginBottom: 24 },
  outerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#0055FF',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  header: { alignItems: 'center', marginBottom: 24 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0C1A30',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  form: { width: '100%', gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: '#0C1A30' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 14, color: '#0C1A30', height: '100%' },
  eyeBtn: { padding: 8 },
  errorText: { fontSize: 12, color: '#EF4444', textAlign: 'center', fontWeight: '600' },
  criteriaCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  criteriaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  criteriaTitle: { fontSize: 12, fontWeight: '800', color: '#0C1A30' },
  checklist: { gap: 8, paddingLeft: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  checkTextActive: { color: '#475569' },
  primaryButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
    paddingBottom: 16,
  },
  footerText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
});
