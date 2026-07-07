import { Redirect, useLocalSearchParams } from 'expo-router';

export default function PlanSuccessScreen() {
  const { metier } = useLocalSearchParams<{ metier?: string }>();
  return <Redirect href={{ pathname: '/(onboarding)/plan-recommend', params: { metier } }} />;
}
