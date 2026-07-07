import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
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
import { verifyOTP, resendOTP } from '../../src/core/auth/authService';
import { useAuthStore } from '../../src/shared/hooks/useAuth';
import { theme } from '../../src/theme';
import ProgressHeader from '../../src/shared/components/ProgressHeader';

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(119); // 1:59 in seconds
  const [resendTimer, setResendTimer] = useState(25); // 25s resend cool down

  const inputRef = useRef<TextInput>(null);
  const setEmailVerified = useAuthStore(s => s.setEmailVerified);

  // Expire timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resend cool down timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleConfirm = async () => {
    if (!code || code.length !== 6) {
      setError('Le code doit contenir 6 chiffres.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await verifyOTP(email, code);
      setEmailVerified(true);

      // Navigate to Step 3: Password creation screen
      router.replace(`/(auth)/password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de vérification';
      if (msg.includes('400') || msg.includes('invalid') || msg.includes('invalide')) {
        setError('Code incorrect ou expiré. Vérifiez et réessayez.');
      } else {
        setError("Erreur de connexion. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setError(null);
    try {
      await resendOTP(email);
      setTimer(119); // Reset expiration timer
      setResendTimer(30); // Cool down 30s
      Alert.alert('Code renvoyé', `Un nouveau code a été envoyé à ${email}.`);
    } catch (err: unknown) {
      setError("Erreur lors du renvoi du code.");
    } finally {
      setResending(false);
    }
  };

  const digits = Array.from({ length: 6 }, (_, index) => code[index] ?? '');

  return (
    <SafeAreaWrapper>
      <ProgressHeader currentStep={2} totalSteps={4} onBack={() => router.replace('/(auth)/register')} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Illustration: Envelope + Paper Airplane */}
          <View style={styles.illustrationContainer}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Ionicons name="mail" size={48} color="#0055FF" />
              </View>
              {/* Paper airplane icon badge */}
              <View style={styles.airplaneBadge}>
                <Ionicons name="send" size={12} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Vérifiez votre adresse e-mail</Text>
            <Text style={styles.subtitle}>
              Nous avons envoyé un code à 6 chiffres à :{' '}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          {/* Code Inputs Grid */}
          <Text style={styles.inputLabel}>Entrez le code à 6 chiffres</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.otpRow}
            onPress={() => inputRef.current?.focus()}
          >
            {digits.map((digit, index) => {
              const isFocused = code.length === index;
              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    isFocused ? styles.otpBoxFocused : null,
                  ]}
                >
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={value => setCode(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
            autoFocus
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Timer banner */}
          <View style={styles.timerCard}>
            <Ionicons name="time-outline" size={20} color="#0055FF" />
            <View style={styles.timerTextContainer}>
              <Text style={styles.timerText}>
                Le code expire dans <Text style={styles.timerTime}>{formatTimer(timer)}</Text>
              </Text>
              <Text style={styles.timerWarning}>Ne partagez jamais votre code avec qui que ce soit.</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.primaryButton, code.length !== 6 && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={code.length !== 6 || loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Vérification...' : 'Vérifier'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Extra options */}
          <View style={styles.optionsContainer}>
            {/* Resend button */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={handleResend}
              disabled={resendTimer > 0 || resending}
            >
              <Ionicons name="mail-unread-outline" size={20} color="#0C1A30" style={styles.optionIcon} />
              <Text style={[styles.optionText, resendTimer > 0 && styles.optionTextDisabled]}>
                Renvoyer le code
              </Text>
              <Text style={styles.optionActionText}>
                {resendTimer > 0 ? `Renvoyer (${resendTimer}s)` : 'Renvoyer'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            {/* Change email button */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => router.replace('/(auth)/register')}
            >
              <Ionicons name="create-outline" size={20} color="#0C1A30" style={styles.optionIcon} />
              <Text style={styles.optionText}>Modifier l'adresse e-mail</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Secure Card */}
          <View style={styles.securityCard}>
            <View style={styles.securityIconCircle}>
              <Ionicons name="shield-checkmark" size={18} color="#0055FF" />
            </View>
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>Vos informations sont en sécurité</Text>
              <Text style={styles.securityDesc}>
                Nous ne partagerons jamais votre e-mail avec qui que ce soit.
              </Text>
            </View>
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
  airplaneBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFB300', // Gold/orange airplane badge
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
  emailText: { color: '#0055FF', fontWeight: '700' },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C1A30',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1.5,
    height: 52,
    justifyContent: 'center',
    flex: 1,
  },
  otpBoxFilled: { borderColor: '#E2E8F0' },
  otpBoxFocused: { borderColor: '#0055FF', backgroundColor: '#FFFFFF' },
  otpDigit: { fontSize: 20, fontWeight: '800', color: '#0C1A30' },
  hiddenInput: {
    height: 1,
    opacity: 0,
    position: 'absolute',
    width: 1,
  },
  errorText: { fontSize: 12, color: '#EF4444', textAlign: 'center', fontWeight: '600', marginBottom: 16 },
  timerCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#E0EBFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  timerTextContainer: { flex: 1 },
  timerText: { fontSize: 12, fontWeight: '800', color: '#0C1A30' },
  timerTime: { color: '#EF4444' },
  timerWarning: { fontSize: 10, color: '#64748B', marginTop: 2 },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 12,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F1F5F9' },
  dividerText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  optionsContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 4,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
  },
  optionIcon: { marginRight: 12 },
  optionText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#0C1A30' },
  optionTextDisabled: { color: '#94A3B8' },
  optionActionText: { fontSize: 12, fontWeight: '600', color: '#0055FF', marginRight: 4 },
  optionDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  securityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextContainer: { flex: 1 },
  securityTitle: { fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 2 },
  securityDesc: { fontSize: 10, color: '#94A3B8', lineHeight: 14 },
});
