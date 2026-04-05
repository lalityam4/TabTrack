import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, Share, Linking,
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
  warning: '#F59E0B',
};

// ─── Compute settlement ───────────────────────────────────────────────────────
function computeSettlement(charges, members, currentUserId) {
  // How much each person owes the card holder (you)
  const owes = {}; // memberId -> amount they owe you
  members.forEach(m => { owes[m.id] = 0; });

  const groupCharges = charges.filter(c => c.status === 'group');

  groupCharges.forEach(charge => {
    if (!charge.assignedTo || charge.assignedTo.length === 0) return;
    const perPerson = charge.amount / charge.assignedTo.length;
    charge.assignedTo.forEach(id => {
      if (id !== currentUserId) {
        owes[id] = (owes[id] || 0) + perPerson;
      }
    });
  });

  return owes;
}

// ─── Person Card ──────────────────────────────────────────────────────────────
function PersonCard({ member, amount, charges, onVenmo, onRequest }) {
  const [expanded, setExpanded] = useState(false);

  if (amount < 0.01) return null;

  const relatedCharges = charges.filter(c =>
    c.status === 'group' && (c.assignedTo || []).includes(member.id)
  );

  return (
    <View style={styles.personCard}>
      <TouchableOpacity
        style={styles.personCardHeader}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.9}
      >
        <View style={styles.personLeft}>
          <View style={styles.personAvatar}>
            <Text style={styles.personInitial}>{member.initials}</Text>
          </View>
          <View>
            <Text style={styles.personName}>{member.name}</Text>
            <Text style={styles.personSub}>owes you</Text>
          </View>
        </View>
        <View style={styles.personRight}>
          <Text style={styles.personAmount}>${amount.toFixed(2)}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16} color={COLORS.textSoft}
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.personCharges}>
          {relatedCharges.map(c => {
            const perPerson = c.amount / (c.assignedTo?.length || 1);
            const catColor = CATEGORY_COLORS[c.merchantCategory] || '#6B7280';
            const catIcon = CATEGORY_ICONS[c.merchantCategory] || 'receipt';
            return (
              <View key={c.id} style={styles.chargeBreakdown}>
                <View style={[styles.chargeBreakdownIcon, { backgroundColor: catColor + '20' }]}>
                  <Ionicons name={catIcon} size={13} color={catColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chargeBreakdownMerchant}>{c.merchant}</Text>
                  {c.note ? <Text style={styles.chargeBreakdownNote}>{c.note}</Text> : null}
                </View>
                <Text style={styles.chargeBreakdownAmount}>${perPerson.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.personActions}>
        <TouchableOpacity style={styles.venmoBtn} onPress={onVenmo} activeOpacity={0.85}>
          <Text style={styles.venmoBtnText}>Request on Venmo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textBtn} onPress={onRequest} activeOpacity={0.85}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.textSoft} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Settlement Screen ─────────────────────────────────────────────────────────
export default function SettlementScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { state } = useApp();

  const trip = state.activeTrip?.id === tripId
    ? state.activeTrip
    : state.pastTrips.find(t => t.id === tripId);

  const charges = state.resolvedCharges.filter(c => c.tripId === tripId);
  const groupCharges = charges.filter(c => c.status === 'group');

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={{ color: COLORS.textSoft }}>Trip not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentUserId = state.user.id;
  const owes = computeSettlement(charges, trip.members, currentUserId);
  const otherMembers = trip.members.filter(m => !m.isYou);

  const totalOwed = otherMembers.reduce((s, m) => s + (owes[m.id] || 0), 0);
  const totalGroupSpend = groupCharges.reduce((s, c) => s + c.amount, 0);

  const handleVenmo = (member, amount) => {
    const note = `${trip.name} expenses`;
    const url = `venmo://paycharge?txn=charge&recipients=${encodeURIComponent(member.name)}&amount=${amount.toFixed(2)}&note=${encodeURIComponent(note)}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const webUrl = `https://venmo.com/?txn=charge&amount=${amount.toFixed(2)}&note=${encodeURIComponent(note)}`;
        Linking.openURL(webUrl);
      }
    });
  };

  const handleTextRequest = (member, amount) => {
    const message = `Hey ${member.name}! Settling up ${trip.name} — you owe $${amount.toFixed(2)}. Let me know when you send it! 🙏`;
    Linking.openURL(`sms:${member.phone || ''}?body=${encodeURIComponent(message)}`);
  };

  const handleShareSummary = () => {
    const lines = [
      `📋 ${trip.name} — Trip Summary`,
      `Total group spend: $${totalGroupSpend.toFixed(2)}`,
      '',
      ...otherMembers
        .filter(m => (owes[m.id] || 0) > 0.01)
        .map(m => `• ${m.name} owes $${owes[m.id].toFixed(2)}`),
      '',
      `Powered by TabTrack`,
    ];
    Share.share({ message: lines.join('\n'), title: `${trip.name} Settlement` });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settlement</Text>
        <TouchableOpacity onPress={handleShareSummary} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTrip}>{trip.name}</Text>
          <Text style={styles.summaryDates}>
            {trip.startDate}{trip.endDate ? ` – ${trip.endDate}` : ' (ongoing)'}
          </Text>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>${totalGroupSpend.toFixed(2)}</Text>
              <Text style={styles.summaryStatLabel}>You covered</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatValue, { color: COLORS.success }]}>
                ${totalOwed.toFixed(2)}
              </Text>
              <Text style={styles.summaryStatLabel}>Coming back to you</Text>
            </View>
          </View>
        </View>

        {/* Who owes what */}
        {totalOwed > 0.01 ? (
          <>
            <Text style={styles.sectionTitle}>Who owes you</Text>
            {otherMembers.map(m => (
              <PersonCard
                key={m.id}
                member={m}
                amount={owes[m.id] || 0}
                charges={groupCharges}
                onVenmo={() => handleVenmo(m, owes[m.id])}
                onRequest={() => handleTextRequest(m, owes[m.id])}
              />
            ))}
          </>
        ) : (
          <View style={styles.allSettled}>
            <Text style={styles.allSettledEmoji}>🎉</Text>
            <Text style={styles.allSettledTitle}>All settled up!</Text>
            <Text style={styles.allSettledSub}>
              No outstanding balances from this trip.
            </Text>
          </View>
        )}

        {/* Itemized list */}
        {groupCharges.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>All group charges</Text>
            <View style={styles.chargesList}>
              {groupCharges.map((c, i) => {
                const catColor = CATEGORY_COLORS[c.merchantCategory] || '#6B7280';
                const catIcon = CATEGORY_ICONS[c.merchantCategory] || 'receipt';
                const assignedNames = (c.assignedTo || []).map(id => {
                  const m = trip.members.find(m => m.id === id);
                  return m ? (m.isYou ? 'You' : m.name) : id;
                });
                return (
                  <View key={c.id} style={[styles.chargeListItem, i < groupCharges.length - 1 && styles.chargeListItemBorder]}>
                    <View style={[styles.chargeListIcon, { backgroundColor: catColor + '20' }]}>
                      <Ionicons name={catIcon} size={15} color={catColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.chargeListMerchant}>{c.merchant}</Text>
                      <Text style={styles.chargeListAssigned}>{assignedNames.join(', ')}</Text>
                    </View>
                    <Text style={styles.chargeListAmount}>${c.amount.toFixed(2)}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white, borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  shareBtn: { padding: 6 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },

  // Summary card
  summaryCard: {
    background: COLORS.white,
    backgroundColor: COLORS.primary, borderRadius: 20, padding: 24,
    marginBottom: 24,
  },
  summaryTrip: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 2 },
  summaryDates: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 20 },
  summaryStats: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, padding: 16,
  },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryStatValue: { fontSize: 24, fontWeight: '800', color: '#fff' },
  summaryStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Section title
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.textSoft,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },

  // Person card
  personCard: {
    backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  personCardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  personLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personAvatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  personInitial: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  personName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  personSub: { fontSize: 12, color: COLORS.textSoft, marginTop: 1 },
  personRight: { flexDirection: 'row', alignItems: 'center' },
  personAmount: { fontSize: 20, fontWeight: '800', color: COLORS.text },

  // Charge breakdown
  personCharges: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#F9FAFB',
  },
  chargeBreakdown: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7,
  },
  chargeBreakdownIcon: {
    width: 26, height: 26, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  chargeBreakdownMerchant: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  chargeBreakdownNote: { fontSize: 11, color: COLORS.textSoft },
  chargeBreakdownAmount: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  // Actions
  personActions: {
    flexDirection: 'row', gap: 10, padding: 14,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  venmoBtn: {
    flex: 1, backgroundColor: '#3D95CE', borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  venmoBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  textBtn: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },

  // All settled
  allSettled: {
    alignItems: 'center', paddingVertical: 40,
  },
  allSettledEmoji: { fontSize: 48, marginBottom: 12 },
  allSettledTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  allSettledSub: { fontSize: 14, color: COLORS.textSoft },

  // Charges list
  chargesList: {
    backgroundColor: COLORS.white, borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
  },
  chargeListItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
  },
  chargeListItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chargeListIcon: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  chargeListMerchant: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  chargeListAssigned: { fontSize: 12, color: COLORS.textSoft, marginTop: 2 },
  chargeListAmount: { fontSize: 15, fontWeight: '700', color: COLORS.text },
});
