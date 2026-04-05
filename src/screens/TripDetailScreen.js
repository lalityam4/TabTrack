import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  FlatList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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
  danger: '#EF4444',
};

// ─── Charge Item ──────────────────────────────────────────────────────────────
function ChargeItem({ charge, members, onPress }) {
  const catColor = CATEGORY_COLORS[charge.merchantCategory] || '#6B7280';
  const catIcon = CATEGORY_ICONS[charge.merchantCategory] || 'receipt';
  const assignedNames = (charge.assignedTo || []).map(id => {
    const m = members.find(m => m.id === id);
    return m ? (m.isYou ? 'You' : m.name) : id;
  });

  return (
    <TouchableOpacity style={styles.chargeItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.chargeIcon, { backgroundColor: catColor + '20' }]}>
        <Ionicons name={catIcon} size={17} color={catColor} />
      </View>
      <View style={styles.chargeInfo}>
        <Text style={styles.chargeMerchant}>{charge.merchant}</Text>
        {charge.note ? <Text style={styles.chargeNote}>{charge.note}</Text> : null}
        {assignedNames.length > 0 && (
          <Text style={styles.chargeAssigned}>{assignedNames.join(', ')}</Text>
        )}
      </View>
      <View style={styles.chargeRight}>
        <Text style={styles.chargeAmount}>${charge.amount.toFixed(2)}</Text>
        {charge.status === 'personal'
          ? <Text style={styles.personalTag}>Just Me</Text>
          : <Text style={styles.groupTag}>Group</Text>
        }
        <Ionicons name="chevron-forward" size={14} color="#D1D5DB" style={{ marginTop: 2 }} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Trip Detail ──────────────────────────────────────────────────────────────
export default function TripDetailScreen({ route, navigation }) {
  const { tripId, isActive } = route.params;
  const { state } = useApp();
  const { user } = state;

  // Force re-render every time this screen comes back into focus
  const [focusTick, setFocusTick] = useState(0);
  useFocusEffect(useCallback(() => { setFocusTick(t => t + 1); }, []));

  const trip = isActive
    ? state.activeTrips.find(t => t.id === tripId)
    : state.pastTrips.find(t => t.id === tripId);

  const charges = state.resolvedCharges.filter(c => c.tripId === tripId);
  const groupCharges = charges.filter(c => c.status === 'group');
  const personalCharges = charges.filter(c => c.status === 'personal');

  // Stats — all recalculated fresh on every render
  const totalGroup = groupCharges.reduce((s, c) => s + c.amount, 0);
  const totalPersonal = personalCharges.reduce((s, c) => s + c.amount, 0);
  const totalAll = totalGroup + totalPersonal;

  // My share = sum of splitAmount for group charges where I am assigned
  const myGroupShare = groupCharges
    .filter(c => c.assignedTo?.includes(user.id))
    .reduce((s, c) => s + (c.splitAmount || 0), 0);

  const [tab, setTab] = useState('group');
  const listRef = useRef(null);

  const switchTab = (newTab) => {
    setTab(newTab);
    // Small delay so state updates before scrolling
    setTimeout(() => {
      listRef.current?.scrollToIndex({ index: 0, animated: true, viewOffset: 0 });
    }, 100);
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Trip not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayCharges = tab === 'group' ? groupCharges : personalCharges;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{trip.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        ref={listRef}
        data={displayCharges}
        keyExtractor={c => c.id}
        onScrollToIndexFailed={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ChargeItem
            charge={item}
            members={trip.members}
            onPress={() => navigation.navigate('ChargeEdit', {
              chargeId: item.id,
              isEditing: true,
            })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border }} />}
        ListHeaderComponent={
          <>
            {/* ── Stats Card ── */}
            <View style={styles.statsCard}>

              {/* Row 1 — Total Spent (hero number) */}
              <View style={styles.heroRow}>
                <View style={styles.heroIconWrap}>
                  <Ionicons name="card-outline" size={15} color={COLORS.primary} />
                </View>
                <Text style={styles.heroLabel}>TOTAL SPENT ON THIS TRIP</Text>
              </View>
              <Text style={styles.heroAmount}>
                ${totalAll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.heroSub}>charged to your credit cards</Text>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {/* Row 2 — Group Charges (tappable) */}
              <TouchableOpacity style={styles.groupRow} onPress={() => switchTab('group')} activeOpacity={0.7}>
                <View style={styles.groupRowLeft}>
                  <View style={styles.groupIconWrap}>
                    <Ionicons name="people" size={14} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.groupRowLabel}>Group Charges</Text>
                    <Text style={styles.groupRowSub}>{groupCharges.length} {groupCharges.length === 1 ? 'charge' : 'charges'} split with others</Text>
                  </View>
                </View>
                <View style={styles.groupRowRight}>
                  <Text style={styles.groupRowAmount}>${totalGroup.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {/* Row 3 — My Share + Just Me side by side */}
              <View style={styles.myRow}>
                {/* My Share — not tappable (it's a subset of group, not a separate tab) */}
                <View style={styles.myChip}>
                  <Text style={styles.myChipLabel}>MY SHARE</Text>
                  <Text style={styles.myChipAmount}>
                    ${myGroupShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.myChipSub}>from group charges</Text>
                </View>

                <View style={styles.myChipDivider} />

                {/* Just Me — tappable, switches to personal tab */}
                <TouchableOpacity style={[styles.myChip, styles.myChipRight]} onPress={() => switchTab('personal')} activeOpacity={0.7}>
                  <Text style={[styles.myChipLabel, { color: COLORS.textSoft }]}>JUST ME</Text>
                  <Text style={[styles.myChipAmount, { color: COLORS.textSoft }]}>
                    ${totalPersonal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3 }}>
                    <Text style={styles.myChipSub}>{personalCharges.length} personal {personalCharges.length === 1 ? 'charge' : 'charges'}</Text>
                    <Ionicons name="chevron-forward" size={10} color={COLORS.textSoft} />
                  </View>
                </TouchableOpacity>
              </View>

            </View>

            {/* Members */}
            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>On this trip</Text>
              <View style={styles.membersRow}>
                {trip.members.map(m => (
                  <View key={m.id} style={styles.memberChip}>
                    <View style={styles.memberChipAvatar}>
                      <Text style={styles.memberChipInitial}>{m.initials}</Text>
                    </View>
                    <Text style={styles.memberChipName}>{m.isYou ? 'You' : m.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Settlement button — show whenever there are any charges */}
            {(charges.length > 0) && (
              <TouchableOpacity
                style={styles.settlementBtn}
                onPress={() => navigation.navigate('Settlement', { tripId })}
                activeOpacity={0.85}
              >
                <View style={styles.settlementBtnLeft}>
                  <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.settlementBtnText}>View settlement summary</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, tab === 'group' && styles.tabActive]}
                onPress={() => switchTab('group')}
              >
                <Text style={[styles.tabText, tab === 'group' && styles.tabTextActive]}>
                  Group ({groupCharges.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, tab === 'personal' && styles.tabActive]}
                onPress={() => switchTab('personal')}
              >
                <Text style={[styles.tabText, tab === 'personal' && styles.tabTextActive]}>
                  Personal ({personalCharges.length})
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTabText}>
              {tab === 'group'
                ? 'No group charges yet. Tap Group on a charge in the queue.'
                : 'No personal charges flagged.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white, borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },

  list: { paddingHorizontal: 20, paddingBottom: 40 },

  // Stats Card
  statsCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 22,
    marginTop: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },

  // Hero — Total Spent
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  heroIconWrap: {
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.primary,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  heroAmount: {
    fontSize: 38, fontWeight: '800', color: COLORS.text,
    letterSpacing: -1, marginBottom: 2,
  },
  heroSub: { fontSize: 12, color: COLORS.textSoft, marginBottom: 18 },

  cardDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 16 },

  // Group Row
  groupRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  groupRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  groupRowLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  groupRowSub: { fontSize: 11, color: COLORS.textSoft, marginTop: 1 },
  groupRowRight: { flexDirection: 'row', alignItems: 'center' },
  groupRowAmount: { fontSize: 18, fontWeight: '800', color: COLORS.text },

  // My Share + Just Me chips
  myRow: { flexDirection: 'row' },
  myChip: { flex: 1, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: COLORS.primaryLight, borderRadius: 14 },
  myChipRight: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.border },
  myChipDivider: { width: 10 },
  myChipLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.primary,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
  },
  myChipAmount: { fontSize: 20, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.5 },
  myChipSub: { fontSize: 11, color: COLORS.textSoft, marginTop: 3 },

  // Members
  membersSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSoft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.white, borderRadius: 10,
    paddingVertical: 6, paddingHorizontal: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  memberChipAvatar: {
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  memberChipInitial: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  memberChipName: { fontSize: 13, fontWeight: '600', color: COLORS.text },

  // Settlement
  settlementBtn: {
    backgroundColor: COLORS.primaryLight, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20, borderWidth: 1, borderColor: '#C4B5FD',
  },
  settlementBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settlementBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },

  // Tabs
  tabs: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: 12, padding: 4, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSoft },
  tabTextActive: { color: '#fff' },

  // Charge item
  chargeItem: {
    flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14,
    backgroundColor: COLORS.white, paddingHorizontal: 14,
  },
  chargeIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  chargeInfo: { flex: 1 },
  chargeMerchant: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  chargeNote: { fontSize: 12, color: COLORS.textSoft, marginTop: 2 },
  chargeAssigned: { fontSize: 12, color: COLORS.primary, marginTop: 3, fontWeight: '500' },
  chargeRight: { alignItems: 'flex-end' },
  chargeAmount: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  personalTag: { fontSize: 11, color: COLORS.textSoft, marginTop: 3 },
  groupTag: { fontSize: 11, color: COLORS.primary, marginTop: 3, fontWeight: '600' },

  // Empty
  emptyTab: { padding: 40, alignItems: 'center' },
  emptyTabText: { fontSize: 14, color: COLORS.textSoft, textAlign: 'center', lineHeight: 22 },

  // Not found
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: COLORS.textSoft },
  backLink: { color: COLORS.primary, fontSize: 15, marginTop: 12, fontWeight: '600' },
});
