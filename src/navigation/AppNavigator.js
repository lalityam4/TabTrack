import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Optional — only active if expo-notifications is installed
let Notifications = null;
try { Notifications = require('expo-notifications'); } catch (_) {}

export const navigationRef = createNavigationContainerRef();

import { useApp } from '../context/AppContext';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ChargeAssignScreen from '../screens/ChargeAssignScreen';
import TripsScreen from '../screens/TripsScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import SettlementScreen from '../screens/SettlementScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#5B4CF5',
  background: '#F5F6FA',
  tabBar: '#FFFFFF',
  tabActive: '#5B4CF5',
  tabInactive: '#9CA3AF',
};

// ─── Badge component ──────────────────────────────────────────────────────────
function TabBadge({ count }) {
  if (!count) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

// ─── Home Stack ───────────────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Queue" component={HomeScreen} />
      <Stack.Screen
        name="ChargeAssign"
        component={ChargeAssignScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// ─── Trips Stack ──────────────────────────────────────────────────────────────
function TripsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripsList" component={TripsScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
      <Stack.Screen
        name="ChargeEdit"
        component={ChargeAssignScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Settlement"
        component={SettlementScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
function MainTabs() {
  const { state } = useApp();
  const pendingCount = state.triageQueue.length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Trips') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return (
            <View style={{ position: 'relative' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'Home' && <TabBadge count={pendingCount} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Queue' }}
      />
      <Tab.Screen
        name="Trips"
        component={TripsStack}
        options={{ tabBarLabel: 'Trips' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Account' }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { state } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  // ── Handle notification tap (single tap, no button pressed) ──────────────
  // When the user taps the notification body, open the app straight to the
  // ChargeAssign screen for that charge — no sliding down needed.
  useEffect(() => {
    if (!Notifications) return;

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const actionId = response.actionIdentifier;
      const { chargeId } = response.notification.request.content.data || {};

      // DEFAULT_ACTION_IDENTIFIER = user tapped the notification itself (not a button)
      if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER && chargeId) {
        // Wait for navigation to be ready then go straight to the charge
        const tryNavigate = () => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Home');
            // Small delay to let the tab switch before pushing the modal
            setTimeout(() => {
              navigationRef.navigate('ChargeAssign', { chargeId, fromNotification: true });
            }, 300);
          } else {
            setTimeout(tryNavigate, 100);
          }
        };
        tryNavigate();
      }
    });

    return () => subscription.remove();
  }, []);

  // Show splash on every cold launch — dismissed by Get Started or Login
  if (showSplash) {
    return (
      <SplashScreen
        onGetStarted={() => setShowSplash(false)}
        onLogin={() => setShowSplash(false)}
      />
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!state.isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBar,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 6,
    paddingBottom: 2,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
