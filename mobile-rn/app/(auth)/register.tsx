import React, { useState } from 'react';
import {
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
import { router } from 'expo-router';
import { sendOTP } from '../../src/core/auth/authService';
import { theme } from '../../src/theme';
import ProgressHeader from '../../src/shared/components/ProgressHeader';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse e-mail.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const emailClean = email.trim().toLowerCase();
      await sendOTP(emailClean);

      // Navigate to OTP screen with email context
      router.replace(`/(auth)/otp?email=${encodeURIComponent(emailClean)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur d'envoi du code";
      setError("Impossible d'envoyer le code de vérification. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ProgressHeader currentStep={1} totalSteps={4} onBack={() => router.replace('/(auth)/welcome')} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Circular Envelope Illustration with Shield */}
          <View style={styles.illustrationContainer}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Ionicons name="mail-open" size={48} color="#0055FF" />
              </View>
              {/* Floating Shield Lock */}
              <View style={styles.shieldLockBadge}>
                <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Header Texts */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Créez votre compte C'PRO</Text>
            <Text style={styles.subtitle}>Entrez votre adresse e-mail pour commencer.</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Email Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Adresse e-mail</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="exemple@domaine.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="shield-checkmark" size={18} color="#0055FF" />
              </View>
              <Text style={styles.infoText}>
                Vos informations sont en sécurité. Nous ne partagerons jamais votre e-mail avec qui que ce soit.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Envoi en cours...' : 'Continuer'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginLinkText}>
                Vous avez déjà un compte ? <Text style={styles.loginLinkStrong}>Se connecter</Text>
              </Text>
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
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  illustrationContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
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
  shieldLockBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#10B981',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
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
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C1A30',
  },
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0C1A30',
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#E0EBFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
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
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLinkStrong: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
