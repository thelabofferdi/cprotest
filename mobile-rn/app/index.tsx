import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../src/shared/hooks/useAuth';

export default function Index() {
  const { authenticated, loading, checkAuth } = useAuthStore();
  const [init, setInit] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setInit(true));
  }, []);

  if (!init || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9FF' }}>
        <ActivityIndicator size="large" color="#003527" />
      </View>
    );
  }

  if (authenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
