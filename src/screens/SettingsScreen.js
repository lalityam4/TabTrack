import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const COLORS = {
  primary: '#5B4CF5',
  primaryLight: '#EDE9FE',
  bg: '#F5F6FA',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSoft: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
};

// ─── Card Row ─────────────────────────────────────────────────────────────────
function CardRow({ card, onRemove }) {
  const bankColors = {
    Chase: '#0F4C81',
    'American Express': '#007B5E',
    'Bank of America': '#E31837',
  };
  const bgColor = bankColors[card.bank] || COLORS.primary;

  return (
    <View style={styles.cardRow}>
      <View style={[styles.cardChip, { backgroundColor: bgColor }]}>
        <Text style={styles.cardChipType}>{card.type}</Text>
        <Text style={styles.cardChipLast4}>••{card.last4}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardBank}>{card.bank} · ••{card.last4}</Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({ icon, label, value, onPress, isLast, toggle, toggleValue, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, isLast && styles.settingRowLast]}
      onPress={toggle ? null : onPress}
      activeOpacity={toggle ? 1 : 0.8}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrap}>
          <Ionicons name={icon} size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
      ) : (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSoft} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { state, removeCard, addCard } = useApp();
  const { user } = state;

  const [tripDetection, setTripDetection] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [pendingNotif, setPendingNotif] = useState(true);

  const handleRemoveCard = (card) => {
    Alert.alert(
      'Remove card?',
      `Remove ${card.name} (••${card.last4}) from TabTrack? You won't receive charge notifications for this card.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeCard(card.id) },
      ]
    );
  };

  const handleAddCard = () => {
    Alert.alert(
      'Connect a card',
      'In production this opens Plaid. Adding a demo card for now.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Demo Card',
          onPress: () => {
            addCard({
              id: `card_${Date.now()}`,
              last4: `${Math.floor(1000 + Math.random() * 9000)}`,
              type: 'Visa',
              name: 'Demo Card',
              bank: 'Demo Bank',
              color: '#374151',
            });
          },
        },
      ]
    );
  };

  const handleChangeHome = () => {
    Alert.alert('Change home city', 'This would open a location picker in production.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{user.name[0]}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
        </View>

        {/* Connected Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Cards</Text>
            <TouchableOpacity onPress={handleAddCard} style={styles.addCardBtn}>
              <Ionicons name="add" size={16} color={COLORS.primary} />
              <Text style={styles.addCardText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContent}>
            {user.connectedCards.length === 0 ? (
              <View style={styles.noCards}>
                <Text style={styles.noCardsText}>No cards connected. Add one to start tracking charges.</Text>
              </View>
            ) : (
              user.connectedCards.map((card, i) => (
                <CardRow
                  key={card.id}
                  card={card}
                  onRemove={() => handleRemoveCard(card)}
                />
              ))
            )}
          </View>
        </View>

        {/* Trip Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Detection</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="location-outline"
              label="Home city"
              value={user.homeCity}
              onPress={handleChangeHome}
            />
            <SettingRow
              icon="navigate-outline"
              label="Auto-detect trips"
              toggle
              toggleValue={tripDetection}
              onToggle={setTripDetection}
              isLast
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="flash-outline"
              label="New charge alerts"
              toggle
              toggleValue={pendingNotif}
              onToggle={setPendingNotif}
            />
            <SettingRow
              icon="alarm-outline"
              label="Daily triage reminder"
              toggle
              toggleValue={dailyReminder}
              onToggle={setDailyReminder}
              isLast
            />
          </View>
          <Text style={styles.sectionNote}>
            TabTrack sends one notification per day max when you have unassigned charges — no spam.
          </Text>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="lock-closed-outline"
              label="Privacy policy"
              onPress={() => Alert.alert('Privacy Policy', 'Opens in browser.')}
            />
            <SettingRow
              icon="document-text-outline"
              label="Terms of service"
              onPress={() => Alert.alert('Terms', 'Opens in browser.')}
              isLast
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={[styles.settingRow, styles.settingRowLast, { justifyContent: 'center' }]}
              onPress={() => Alert.alert('Sign Out', 'You would be signed out.')}
              activeOpacity={0.8}
            >
              <Text style={[styles.settingLabel, { color: COLORS.danger, fontWeight: '600' }]}>
                Sign out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>TabTrack v1.0 · Built on Plaid + Expo</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },

  // Profile
  profileCard: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  profileInitial: { fontSize: 24, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  profileEmail: { fontSize: 13, color: COLORS.textSoft, marginTop: 2 },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.textSoft,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: COLORS.white, borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
  },
  sectionNote: { fontSize: 12, color: COLORS.textSoft, marginTop: 8, lineHeight: 18 },

  // Add card
  addCardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primaryLight, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  addCardText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // Card rows
  cardRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  cardChip: {
    width: 52, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  cardChipType: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  cardChipLast4: { fontSize: 13, fontWeight: '800', color: '#fff' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  cardBank: { fontSize: 12, color: COLORS.textSoft, marginTop: 1 },
  removeBtn: { padding: 8 },

  // Setting rows
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  settingRowLast: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { fontSize: 14, color: COLORS.textSoft },

  // No cards
  noCards: { padding: 20, alignItems: 'center' },
  noCardsText: { fontSize: 14, color: COLORS.textSoft, textAlign: 'center', lineHeight: 21 },

  version: { fontSize: 12, color: COLORS.border, textAlign: 'center', marginTop: 8 },
});
