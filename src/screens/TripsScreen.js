import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  FlatList, Alert,
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
  successLight: '#D1FAE5',
  danger: '#EF4444',
};

// ─── Active Trip Card ─────────────────────────────────────────────────────────
function ActiveTripCard({ trip, resolvedCount, totalAmount, onPress, onEnd }) {
  return (
    <TouchableOpacity style={styles.activeTripCard} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.activeTripHeader}>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
        <TouchableOpacity onPress={onEnd} style={styles.endBtn}>
          <Text style={styles.endBtnText}>End Trip</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.activeTripName}>{trip.name}</Text>
      <Text style={styles.activeTripDates}>Started {trip.startDate}</Text>

      <View style={styles.activeTripStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalAmount.toFixed(0)}</Text>
          <Text style={styles.statLabel}>logged</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{resolvedCount}</Text>
          <Text style={styles.statLabel}>charges sorted</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{trip.members.length}</Text>
          <Text style={styles.statLabel}>people</Text>
        </View>
      </View>

      <View style={styles.activeMembersRow}>
        {trip.members.slice(0, 6).map((m, i) => (
          <View key={m.id} style={[styles.memberBubble, { marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }]}>
            <Text style={styles.memberBubbleText}>{m.initials}</Text>
          </View>
        ))}
        {trip.members.length > 6 && (
          <View style={[styles.memberBubble, styles.memberBubbleMore, { marginLeft: -8 }]}>
            <Text style={styles.memberBubbleText}>+{trip.members.length - 6}</Text>
          </View>
        )}
        <Text style={styles.membersLabel}>
          {trip.members.map(m => m.isYou ? 'You' : m.name).join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Past Trip Row ─────────────────────────────────────────────────────────────
function PastTripRow({ trip, onPress }) {
  return (
    <TouchableOpacity style={styles.pastTripRow} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.pastTripLeft}>
        <View style={styles.pastTripIcon}>
          <Ionicons name="airplane" size={18} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.pastTripName}>{trip.name}</Text>
          <Text style={styles.pastTripDates}>{trip.startDate} – {trip.endDate}</Text>
        </View>
      </View>
      <View style={styles.pastTripRight}>
        {trip.youAreOwed > 0 && (
          <Text style={styles.owedAmount}>+${trip.youAreOwed.toFixed(0)}</Text>
        )}
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSoft} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Trips Screen ─────────────────────────────────────────────────────────────
export default function TripsScreen({ navigation }) {
  const { state, endTrip } = useApp();
  const { activeTrips, pastTrips, resolvedCharges } = state;

  const handleNewTrip = () => {
    navigation.navigate('CreateTrip');  // always allowed — multiple trips supported
  };

  const handleEndTrip = (trip) => {
    Alert.alert(
      'End trip?',
      `This will close "${trip.name}" and let you generate the settlement.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: () => endTrip(trip.id),
        },
      ]
    );
  };

  // Calculate stats per trip
  const getStatsForTrip = (tripId) => {
    const resolved = resolvedCharges.filter(c => c.tripId === tripId);
    return {
      resolvedCount: resolved.length,
      totalAmount: resolved.reduce((s, c) => s + (c.status === 'group' ? c.amount : 0), 0),
    };
  };

  const hasNoTrips = activeTrips.length === 0 && pastTrips.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips</Text>
        <TouchableOpacity
          style={styles.newTripBtn}
          onPress={handleNewTrip}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={COLORS.primary} />
          <Text style={styles.newTripBtnText}>New trip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={pastTrips}
        keyExtractor={t => t.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Active trips — one card per trip */}
            {activeTrips.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.sectionLabel}>
                  CURRENT · {activeTrips.length} {activeTrips.length === 1 ? 'TRIP' : 'TRIPS'}
                </Text>
                {activeTrips.map((trip, index) => {
                  const { resolvedCount, totalAmount } = getStatsForTrip(trip.id);
                  return (
                    <View key={trip.id} style={{ marginBottom: index < activeTrips.length - 1 ? 12 : 0 }}>
                      <ActiveTripCard
                        trip={trip}
                        resolvedCount={resolvedCount}
                        totalAmount={totalAmount}
                        onPress={() => navigation.navigate('TripDetail', { tripId: trip.id, isActive: true })}
                        onEnd={() => handleEndTrip(trip)}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {pastTrips.length > 0 && (
              <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>PAST TRIPS</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <PastTripRow
            trip={item}
            onPress={() => navigation.navigate('TripDetail', { tripId: item.id, isActive: false })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          hasNoTrips ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🧳</Text>
              <Text style={styles.emptyTitle}>No trips yet</Text>
              <Text style={styles.emptySubtitle}>
                Start a trip before you leave home and TabTrack will track every
                group expense automatically.
              </Text>
              <TouchableOpacity
                style={styles.startFirstBtn}
                onPress={handleNewTrip}
                activeOpacity={0.85}
              >
                <Text style={styles.startFirstBtnText}>Start your first trip</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  newTripBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  newTripBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textSoft,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },

  // Active trip card
  activeTripCard: {
    backgroundColor: COLORS.primary, borderRadius: 20, padding: 22,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  activeTripHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  liveText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  endBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  endBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  activeTripName: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 2 },
  activeTripDates: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 },

  activeTripStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12,
    padding: 14, marginBottom: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },

  activeMembersRow: { flexDirection: 'row', alignItems: 'center' },
  memberBubble: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primary,
  },
  memberBubbleMore: { backgroundColor: 'rgba(255,255,255,0.15)' },
  memberBubbleText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  membersLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.75)', marginLeft: 10, flex: 1,
    fontWeight: '500',
  },

  // Past trips
  pastTripRow: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: COLORS.border,
  },
  pastTripLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pastTripIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  pastTripName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  pastTripDates: { fontSize: 12, color: COLORS.textSoft, marginTop: 2 },
  pastTripRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  owedAmount: { fontSize: 14, fontWeight: '700', color: COLORS.success },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  emptySubtitle: {
    fontSize: 15, color: COLORS.textSoft, textAlign: 'center', lineHeight: 23,
    marginBottom: 28,
  },
  startFirstBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 15,
  },
  startFirstBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

});
