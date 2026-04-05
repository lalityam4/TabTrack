import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

// expo-notifications is optional — only active after install + pod install + Xcode rebuild
let Notifications = null;
try { Notifications = require('expo-notifications'); } catch (_) {}

// Show notifications even when app is in the foreground
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function setupNotifications() {
  if (!Notifications) return;

  // Request permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Register the "Group / Just me" action category
  await Notifications.setNotificationCategoryAsync('CHARGE_TRIAGE', [
    {
      identifier: 'GROUP',
      buttonTitle: 'Group',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'JUST_ME',
      buttonTitle: 'Just me',
      options: { opensAppToForeground: false },
    },
  ]);
}

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AppProvider>
  );
}
