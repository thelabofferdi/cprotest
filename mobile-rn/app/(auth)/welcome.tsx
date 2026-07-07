import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme';

const SECTORS = [
  { id: 'agri', label: 'Agriculture', icon: 'tractor', color: '#4CAF50' },
  { id: 'elevage', label: 'Élevage', icon: 'cow', color: '#795548' },
  { id: 'commerce', label: 'Commerce', icon: 'storefront', color: '#2196F3' },
  { id: 'transfo', label: 'Transformation', icon: 'flask-outline', color: '#FF9800' },
  { id: 'online', label: 'Vente en ligne', icon: 'cellphone-cog', color: '#9C27B0' },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo C'PRO */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Pitch / Title Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Gérez votre activité{'\n'}
            <Text style={styles.heroTitleAccent}>simplement.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Suivez vos recettes, analysez vos performances et{' '}
            <Text style={styles.subtitleBold}>développez</Text> votre entreprise.
          </Text>
        </View>

        {/* Section Secteurs */}
        <View style={styles.sectorsHeader}>
          <View style={styles.dot} />
          <Text style={styles.sectorsHeaderText}>Pour tous les acteurs du terrain</Text>
          <View style={styles.dot} />
        </View>

        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {SECTORS.map((sector) => (
              <View key={sector.id} style={styles.sectorCard}>
                <View style={[styles.sectorIconBg, { backgroundColor: sector.color + '10' }]}>
                  <MaterialCommunityIcons
                    name={sector.icon as any}
                    size={36}
                    color={sector.color}
                  />
                </View>
                <Text style={styles.sectorLabel}>{sector.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Value Propositions Container */}
        <View style={styles.propsCard}>
          {/* Prop 1 */}
          <View style={styles.propRow}>
            <View style={styles.propIconCircle}>
              <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.propTextContainer}>
              <Text style={styles.propTitle}>Suivez vos finances</Text>
              <Text style={styles.propDesc}>Enregistrez facilement vos recettes et dépenses.</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.propDivider} />

          {/* Prop 2 */}
          <View style={styles.propRow}>
            <View style={styles.propIconCircle}>
              <Ionicons name="bar-chart" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.propTextContainer}>
              <Text style={styles.propTitle}>Comprenez vos performances</Text>
              <Text style={styles.propDesc}>Analysez vos données et identifiez ce qui compte vraiment.</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.propDivider} />

          {/* Prop 3 */}
          <View style={styles.propRow}>
            <View style={styles.propIconCircle}>
              <Ionicons name="rocket" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.propTextContainer}>
              <Text style={styles.propTitle}>Prenez de meilleures décisions</Text>
              <Text style={styles.propDesc}>Planifiez vos actions et développez votre activité sereinement.</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.primaryButtonText}>Créer mon espace</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginLinkText}>
              Vous avez déjà un compte ? <Text style={styles.loginLinkStrong}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0C1A30',
    textAlign: 'center',
    lineHeight: 34,
  },
  heroTitleAccent: {
    color: theme.colors.primary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  subtitleBold: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  sectorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  sectorsHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C1A30',
    letterSpacing: 0,
  },
  carouselContainer: {
    width: '100%',
    marginBottom: 24,
  },
  carousel: {
    paddingLeft: 4,
    paddingRight: 20,
    gap: 12,
  },
  sectorCard: {
    width: 100,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    padding: 8,
  },
  sectorIconBg: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C1A30',
    textAlign: 'center',
  },
  propsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  propIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E9F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propTextContainer: {
    flex: 1,
  },
  propTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C1A30',
  },
  propDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  propDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loginLink: {
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLinkStrong: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
