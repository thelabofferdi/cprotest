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
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signIn } from '../../src/core/auth/authService';
import { useAuthStore } from '../../src/shared/hooks/useAuth';
import { theme } from '../../src/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkAuth = useAuthStore(s => s.checkAuth);

  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim().toLowerCase(), password);
      await checkAuth();
      router.replace('/(tabs)/dashboard');
    } catch (err: unknown) {
      setError('Adresse email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: Math.max(insets.top, 24) }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Custom Back/Close Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/welcome')}>
            <Ionicons name="close" size={22} color="#0C1A30" />
          </TouchableOpacity>

          {/* Circular Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Ionicons name="key-outline" size={48} color="#0055FF" />
              </View>
              {/* Floating padlock badge */}
              <View style={styles.badge}>
                <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Bon retour sur C’PRO</Text>
            <Text style={styles.subtitle}>Connectez-vous pour accéder à votre tableau de bord.</Text>
          </View>

          {/* Form */}
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

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Se connecter</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerLinkText}>
                Nouveau sur C'PRO ? <Text style={styles.registerLinkStrong}>Créer mon espace</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Secure Card */}
          <View style={styles.securityCard}>
            <View style={styles.securityIconCircle}>
              <Ionicons name="shield-checkmark" size={18} color="#0055FF" />
            </View>
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>Connexion 100% sécurisée</Text>
              <Text style={styles.securityDesc}>
                Vos données sont chiffrées localement et protégées conformément aux normes de sécurité.
              </Text>
            </View>
          </View>

          {/* Footer badge */}
          <View style={styles.footerContainer}>
            <Ionicons name="lock-closed" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>Paiement 100% sécurisé</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  illustrationContainer: { marginTop: 10, marginBottom: 20 },
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
  badge: {
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
  registerLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  registerLinkText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLinkStrong: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
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
    marginTop: 20,
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
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
});
