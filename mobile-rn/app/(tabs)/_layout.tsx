import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '../../src/shared/hooks/useAuth';
import { useProfileStore } from '../../src/shared/hooks/useProfile';
import { useProfileConfigStore } from '../../src/shared/hooks/useProfileConfig';
import { useUIStore } from '../../src/shared/hooks/useUIStore';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuickTransactionModal } from '../../src/shared/components/QuickTransactionModal';
import { QuickActionsSheet } from '../../src/shared/components/QuickActionsSheet';
import { getPilotageConfig } from '../../src/shared/utils/pilotage';
import { theme } from '../../src/theme';

export default function TabsLayout() {
  const { authenticated, loading, checkAuth } = useAuthStore();
  const profile = useProfileStore(s => s.profile);
  const profileConfig = useProfileConfigStore(s => s.config);
  const pilotage = getPilotageConfig({
    metier: profile?.metier,
    economicUnit: profileConfig?.economicUnit,
  });

  const {
    quickAddVisible,
    setQuickAddVisible,
    quickAddType,
    setQuickAddType,
    quickAddCategory,
    setQuickAddCategory,
    actionsSheetVisible,
    setActionsSheetVisible,
  } = useUIStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) return null;
  if (!authenticated) return <Redirect href="/(auth)/login" />;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: pilotage.primaryColor,
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: -2 },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E2E8F0',
            borderTopWidth: 1,
            minHeight: 66,
            paddingHorizontal: 12,
            paddingBottom: 8,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.03,
            shadowRadius: 6,
            elevation: 8,
          },
          tabBarItemStyle: {
            borderRadius: 0,
            marginHorizontal: 0,
          },
        }}
      >
        {/* Tab 1: Activité */}
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Activité',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={focused ? 22 : 20} color={color} />
            ),
          }}
        />

        {/* Tab 2: Journal */}
        <Tabs.Screen
          name="journal"
          options={{
            title: pilotage.journalLabel,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'book' : 'book-outline'} size={focused ? 22 : 20} color={color} />
            ),
          }}
        />

        {/* Tab 3: Middle Plus Floating Action Button */}
        <Tabs.Screen
          name="plus-action"
          options={{
            title: '',
            tabBarButton: () => {
              return (
                <TouchableOpacity
                  style={styles.plusButtonContainer}
                  activeOpacity={0.8}
                  onPress={() => setActionsSheetVisible(true)}
                >
                  <View style={[styles.plusButtonInner, { backgroundColor: pilotage.primaryColor, shadowColor: pilotage.primaryColor }]}>
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.plusButtonLabel, { color: pilotage.primaryColor }]} numberOfLines={1}>
                    {pilotage.fabLabel}
                  </Text>
                </TouchableOpacity>
              );
            },
          }}
        />

        {/* Tab 4: Analyse */}
        <Tabs.Screen
          name="analyse"
          options={{
            title: pilotage.analyseLabel,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={focused ? 22 : 20} color={color} />
            ),
          }}
        />

        {/* Tab 5: Profil */}
        <Tabs.Screen
          name="profil"
          options={{
            title: 'Profil',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={focused ? 22 : 20} color={color} />
            ),
          }}
        />

        {/* Hidden screen: documents */}
        <Tabs.Screen
          name="documents"
          options={{
            href: null,
          }}
        />

        {/* Hidden screen: bons-plans */}
        <Tabs.Screen
          name="bons-plans"
          options={{
            href: null,
          }}
        />

        {/* Hidden screen: academie */}
        <Tabs.Screen
          name="academie"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Global Quick Transaction Entry Sheet */}
      <QuickTransactionModal
        visible={quickAddVisible}
        initialType={quickAddType}
        initialCategory={quickAddCategory}
        onClose={() => setQuickAddVisible(false)}
        onSaved={(tx) => {
          // Transaction saved successfully
          console.log('[Tabs] Transaction saved globally:', tx);
        }}
      />

      {/* Global Quick Actions Selection Sheet */}
      <QuickActionsSheet
        visible={actionsSheetVisible}
        onClose={() => setActionsSheetVisible(false)}
        onSelectAction={(type, category) => {
          setQuickAddType(type);
          setQuickAddCategory(category || '');
          setQuickAddVisible(true);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  plusButtonContainer: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
    width: 76,
    height: 72,
  },
  plusButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  plusButtonLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
    maxWidth: 76,
  },
});
