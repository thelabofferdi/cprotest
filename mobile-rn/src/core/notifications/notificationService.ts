import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return null;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
  });
}

export async function scheduleLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // immediate
  });
}

export async function scheduleReminderNotification(title: string, body: string, delaySeconds: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
    },
  });
}

// Dépenses > 80% recettes alert
export async function checkSpendingAlert(ca: number, charges: number) {
  if (ca > 0 && charges / ca > 0.8) {
    await scheduleLocalNotification(
      "⚠️ Alerte C'PRO",
      `Tes dépenses représentent ${Math.round((charges / ca) * 100)}% de tes recettes. Attention !`,
      { type: 'spending_alert' }
    );
  }
}
