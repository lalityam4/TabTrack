import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  SectionList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../data/mockData';

const COLORS = {
  primary: '#5B4CF5',
  primaryLight: '#EDE9FE',
  bg: '#F5F6FA',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSoft: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
};

// ─── Trip Banner ──────────────────────────────────────────────────────────────
function TripBanner({ activeTrips, onEndTrip, onManage }) {
  if (!activeTrips || activeTrips.length === 0) return null;

  // Multiple trips — show a count + manage button
  if (activeTrips.length > 1) {
    return (
      <View style={styles.tripBanner}>
        <View style={styles.tripBannerLeft}>
          <View style={styles.tripDot} />
          <View>
            <Text style={styles.tripBannerLabel}>Active trips</Text>
            <Text style={styles.tripBannerName}>{activeTrips.length} trips running</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.manageTripBtn} onPress={onManage} activeOpacity={0.8}>
          <Text style={styles.manageTripText}>Manage</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Single trip — show name + end button
  const trip = activeTrips[0];
  return (
    <View style={styles.tripBanner}>
      <View style={styles.tripBannerLeft}>
        <View style={styles.tripDot} />
        <View>
          <Text style={styles.tripBannerLabel}>Active trip</Text>
          <Text style={styles.tripBannerName}>{trip.name}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.endTripBtn} onPress={() => onEndTrip(trip)} activeOpacity={0.8}>
        <Text style={styles.endTripText}>End Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>✅</Text>
      <Text style={styles.emptyTitle}>Queue is clear</Text>
      <Text style={styles.emptySubtitle}>
        New charges from your connected cards will appear here. Every one gets a
        quick Group / Just me call.
      </Text>
    </View>
  );
}

// ─── Sorted Charge Card (user already responded via notification) ─────────────
function SortedChargeCard({ charge, onAssignMembers }) {
  const catColor = CATEGORY_COLORS[charge.merchantCategory] || CATEGORY_COLORS.Other;
  const catIcon = CATEGORY_ICONS[charge.merchantCategory] || CATEGORY_ICONS.Other;

  return (
    <View style={styles.chargeCard}>
      {/* Confirmed badge */}
      <View style={styles.confirmedBadge}>
        <Ionicons name="checkmark-circle" size={13} color={COLORS.success} style={{ marginRight: 4 }} />
        <Text style={styles.confirmedBadgeText}>Group · via notification</Text>
      </View>

      <View style={styles.chargeTop}>
        <View style={[styles.chargeIcon, { backgroundColor: catColor + '20' }]}>
          <Ionicons name={catIcon} size={20} color={catColor} />
        </View>
        <View style={styles.chargeMeta}>
          <Text style={styles.chargeMerchant} numberOfLines={1}>{charge.merchant}</Text>
          <Text style={styles.chargeDate}>{charge.date} · ••{charge.card}</Text>
        </View>
        <Text style={styles.chargeAmount}>${charge.amount.toFixed(2)}</Text>
      </View>

      {/* Assign members CTA */}
      <TouchableOpacity
        style={styles.assignBtn}
        onPress={onAssignMembers}
        activeOpacity={0.8}
      >
        <Ionicons name="people-outline" size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
        <Text style={styles.assignBtnText}>Assign members</Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Missed Charge Card (user missed the notification) ───────────────────────
function MissedChargeCard({ charge, onGroup, onJustMe }) {
  const catColor = CATEGORY_COLORS[charge.merchantCategory] || CATEGORY_COLORS.Other;
  const catIcon = CATEGORY_ICONS[charge.merchantCategory] || CATEGORY_ICONS.Other;

  return (
    <View style={[styles.chargeCard, styles.missedChargeCard]}>
      {/* Missed badge */}
      <View style={styles.missedBadge}>
        <Ionicons name="notifications-off-outline" size={13} color={COLORS.warning} style={{ marginRight: 4 }} />
        <Text style={styles.missedBadgeText}>Missed notification</Text>
      </View>

      <View style={styles.chargeTop}>
        <View style={[styles.chargeIcon, { backgroundColor: catColor + '20' }]}>
          <Ionicons name={catIcon} size={20} color={catColor} />
        </View>
        <View style={styles.chargeMeta}>
          <Text style={styles.chargeMerchant} numberOfLines={1}>{charge.merchant}</Text>
          <Text style={styles.chargeDate}>{charge.date} · ••{charge.card}</Text>
        </View>
        <Text style={styles.chargeAmount}>${charge.amount.toFixed(2)}</Text>
      </View>

      {/* Group / Just Me buttons */}
      <View style={styles.chargeActions}>
        <TouchableOpacity style={styles.groupBtn} onPress={onGroup} activeOpacity={0.8}>
          <Ionicons name="people-outline" size={15} color={COLORS.primary} style={{ marginRight: 5 }} />
          <Text style={styles.groupBtnText}>Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.personalBtn} onPress={onJustMe} activeOpacity={0.8}>
          <Ionicons name="person-outline" size={15} color={COLORS.textSoft} style={{ marginRight: 5 }} />
          <Text style={styles.personalBtnText}>Just Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, icon, iconColor, count }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={14} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={[styles.sectionBadge, { backgroundColor: iconColor + '18' }]}>
            <Text style={[styles.sectionBadgeText, { color: iconColor }]}>{count}</Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { state, flagAsPersonal, simulateNewCharge, endTrip } = useApp();
  const { triageQueue, activeTrips, user } = state;

  // Bug fix: removed pre-flagging here — ChargeAssign handles trip + member assignment
  const handleGroup = (charge) => {
    navigation.navigate('ChargeAssign', { chargeId: charge.id });
  };

  // Bug fix: pass tripId, and ask which trip if multiple are active
  const handlePersonal = (charge) => {
    if (activeTrips.length > 1) {
      Alert.alert(
        'Which trip?',
        `Tag $${charge.amount.toFixed(2)} at ${charge.merchant} to:`,
        [
          ...activeTrips.map(trip => ({
            text: trip.name,
            onPress: () => flagAsPersonal(charge.id, trip.id),
          })),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    // Only 1 trip — resolve immediately with its id
    flagAsPersonal(charge.id, activeTrips[0]?.id);
  };

  // Bug fix: accept trip object, pass trip.id to endTrip()
  const handleEndTrip = (trip) => {
    Alert.alert(
      'End trip?',
      `This will close "${trip.name}" and let you generate the settlement summary.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: () => {
            endTrip(trip.id);
            navigation.navigate('Trips', { screen: 'TripsList' });
          },
        },
      ]
    );
  };

  // Split queue into two buckets
  const sortedCharges = triageQueue.filter(c => c.status === 'group');   // responded via notification
  const missedCharges = triageQueue.filter(c => c.status === 'pending'); // missed notification

  const totalCount = sortedCharges.length + missedCharges.length;

  // Build sections — only include a section if it has items
  const sections = [];
  if (sortedCharges.length > 0) {
    sections.push({
      key: 'sorted',
      data: sortedCharges,
    });
  }
  if (missedCharges.length > 0) {
    sections.push({
      key: 'missed',
      data: missedCharges,
    });
  }

  const renderItem = ({ item, section }) => {
    if (section.key === 'sorted') {
      return (
        <SortedChargeCard
          charge={item}
          onAssignMembers={() => navigation.navigate('ChargeAssign', { chargeId: item.id })}
        />
      );
    }
    return (
      <MissedChargeCard
        charge={item}
        onGroup={() => handleGroup(item)}
        onJustMe={() => handlePersonal(item)}
      />
    );
  };

  const renderSectionHeader = ({ section }) => {
    if (section.key === 'sorted') {
      return (
        <SectionHeader
          title="Sorted from notification"
          subtitle="You responded — now assign members"
          icon="checkmark-circle-outline"
          iconColor={COLORS.success}
          count={sortedCharges.length}
        />
      );
    }
    return (
      <SectionHeader
        title="Missed · Needs your input"
        subtitle="You didn't catch the notification — sort these now"
        icon="notifications-off-outline"
        iconColor={COLORS.warning}
        count={missedCharges.length}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Hey {user.name} 👋</Text>
          <Text style={styles.headerTitle}>
            {totalCount > 0
              ? `${totalCount} charge${totalCount > 1 ? 's' : ''} to sort`
              : 'Queue is clear'}
          </Text>
        </View>
        <TouchableOpacity style={styles.simBtn} onPress={simulateNewCharge} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
          <Text style={styles.simBtnText}>Simulate</Text>
        </TouchableOpacity>
      </View>

      {/* Active Trip Banner */}
      <TripBanner
        activeTrips={activeTrips}
        onEndTrip={handleEndTrip}
        onManage={() => navigation.navigate('Trips', { screen: 'TripsList' })}
      />

      {/* Queue */}
      {totalCount === 0 ? (
        <EmptyState />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          SectionSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerGreeting: { fontSize: 14, color: COLORS.textSoft, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },

  simBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  simBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // Trip Banner
  tripBanner: {
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  tripBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tripDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  tripBannerLabel: { fontSize: 11, color: COLORS.textSoft, fontWeight: '500', marginBottom: 1 },
  tripBannerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  endTripBtn: {
    backgroundColor: '#FEF2F2', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#FECACA',
  },
  endTripText: { fontSize: 13, fontWeight: '600', color: COLORS.danger },
  manageTripBtn: {
    backgroundColor: COLORS.primaryLight, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#C4B5FD',
  },
  manageTripText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // List
  list: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 4 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 16, marginBottom: 12,
  },
  sectionIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, letterSpacing: 0.1 },
  sectionBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  sectionBadgeText: { fontSize: 11, fontWeight: '700' },
  sectionSubtitle: { fontSize: 12, color: COLORS.textSoft },

  // Shared Card base
  chargeCard: {
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  missedChargeCard: {
    borderColor: '#FDE68A',  // subtle yellow border for missed
  },

  chargeTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  chargeIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  chargeMeta: { flex: 1 },
  chargeMerchant: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  chargeDate: { fontSize: 12, color: COLORS.textSoft, marginTop: 2 },
  chargeAmount: { fontSize: 20, fontWeight: '800', color: COLORS.text },

  // Sorted card elements
  confirmedBadge: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.successLight,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 12,
  },
  confirmedBadgeText: { fontSize: 11, fontWeight: '600', color: '#065F46' },

  assignBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#C4B5FD',
  },
  assignBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  // Missed card elements
  missedBadge: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warningLight,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 12,
  },
  missedBadgeText: { fontSize: 11, fontWeight: '600', color: '#92400E' },

  chargeActions: { flexDirection: 'row', gap: 10 },
  groupBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingVertical: 11,
    borderWidth: 1, borderColor: '#C4B5FD',
  },
  groupBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  personalBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 10, paddingVertical: 11,
    borderWidth: 1, borderColor: COLORS.border,
  },
  personalBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSoft },

  // Empty state
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingBottom: 80,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  emptySubtitle: { fontSize: 15, color: COLORS.textSoft, textAlign: 'center', lineHeight: 23 },
});
