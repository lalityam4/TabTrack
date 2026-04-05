import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert,
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
  warningLight: '#FEF3C7',
};

// ─── Trip Picker ──────────────────────────────────────────────────────────────
function TripPicker({ trips, selectedTripId, onSelect }) {
  if (trips.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Which trip?</Text>
      <View style={styles.tripPickerGrid}>
        {trips.map(trip => {
          const isSelected = trip.id === selectedTripId;
          return (
            <TouchableOpacity
              key={trip.id}
              style={[styles.tripPickerCard, isSelected && styles.tripPickerCardSelected]}
              onPress={() => onSelect(trip.id)}
              activeOpacity={0.8}
            >
              <View style={styles.tripPickerRow}>
                <View style={[styles.tripPickerIcon, isSelected && styles.tripPickerIconSelected]}>
                  <Ionicons name="airplane" size={14} color={isSelected ? '#fff' : COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tripPickerName, isSelected && styles.tripPickerNameSelected]} numberOfLines={1}>
                    {trip.name}
                  </Text>
                  <Text style={[styles.tripPickerMeta, isSelected && styles.tripPickerMetaSelected]}>
                    {trip.members.length} {trip.members.length === 1 ? 'person' : 'people'} · since {trip.startDate}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Quick Sort Banner (shown only when arriving from a notification tap) ─────
function QuickSortBanner({ charge, onJustMe, onGroup }) {
  return (
    <View style={styles.quickBanner}>
      {/* Icon + label */}
      <View style={styles.quickBannerTop}>
        <View style={styles.quickBannerIconWrap}>
          <Ionicons name="notifications" size={16} color={COLORS.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.quickBannerTitle}>Quick sort</Text>
          <Text style={styles.quickBannerSub}>
            Was <Text style={{ fontWeight: '700', color: COLORS.text }}>${charge.amount.toFixed(2)}</Text> at {charge.merchant} shared with others?
          </Text>
        </View>
      </View>

      {/* Two big buttons */}
      <View style={styles.quickBannerActions}>
        <TouchableOpacity style={styles.quickJustMeBtn} onPress={onJustMe} activeOpacity={0.85}>
          <Ionicons name="person" size={16} color={COLORS.textSoft} style={{ marginRight: 6 }} />
          <Text style={styles.quickJustMeText}>Just Me</Text>
          <Text style={styles.quickBtnHint}>  · done</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickGroupBtn} onPress={onGroup} activeOpacity={0.85}>
          <Ionicons name="people" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.quickGroupText}>Group</Text>
          <Text style={styles.quickGroupHint}>  · assign below</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Member Avatar ─────────────────────────────────────────────────────────────
function MemberAvatar({ member, selected, onToggle }) {
  return (
    <TouchableOpacity style={styles.memberWrap} onPress={onToggle} activeOpacity={0.8}>
      <View style={[styles.memberAvatar, selected && styles.memberAvatarSelected]}>
        <Text style={[styles.memberInitial, selected && styles.memberInitialSelected]}>
          {member.initials}
        </Text>
        {selected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        )}
      </View>
      <Text style={[styles.memberName, selected && styles.memberNameSelected]}>
        {member.isYou ? 'You' : member.name}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Split Preview ─────────────────────────────────────────────────────────────
function SplitPreview({ charge, selectedMembers, allMembers }) {
  if (selectedMembers.length === 0) return null;
  const perPerson = charge.amount / selectedMembers.length;
  const members = allMembers.filter(m => selectedMembers.includes(m.id));

  return (
    <View style={styles.splitPreview}>
      <Text style={styles.splitTitle}>Split preview</Text>
      {members.map(m => (
        <View key={m.id} style={styles.splitRow}>
          <View style={styles.splitAvatarWrap}>
            <View style={[styles.splitAvatar]}>
              <Text style={styles.splitAvatarText}>{m.initials}</Text>
            </View>
            <Text style={styles.splitName}>{m.isYou ? 'You' : m.name}</Text>
          </View>
          <Text style={styles.splitAmount}>${perPerson.toFixed(2)}</Text>
        </View>
      ))}
      <View style={styles.splitTotal}>
        <Text style={styles.splitTotalLabel}>Total</Text>
        <Text style={styles.splitTotalAmount}>${charge.amount.toFixed(2)}</Text>
      </View>
    </View>
  );
}

// ─── Status Toggle (edit mode only) ──────────────────────────────────────────
function StatusToggle({ value, onChange }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Type</Text>
      <View style={styles.statusToggleRow}>
        <TouchableOpacity
          style={[styles.statusToggleBtn, value === 'personal' && styles.statusToggleBtnActive]}
          onPress={() => onChange('personal')}
          activeOpacity={0.8}
        >
          <Ionicons name="person" size={15} color={value === 'personal' ? COLORS.white : COLORS.textSoft} style={{ marginRight: 6 }} />
          <Text style={[styles.statusToggleText, value === 'personal' && styles.statusToggleTextActive]}>Just Me</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusToggleBtn, value === 'group' && styles.statusToggleBtnActive]}
          onPress={() => onChange('group')}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={15} color={value === 'group' ? COLORS.white : COLORS.textSoft} style={{ marginRight: 6 }} />
          <Text style={[styles.statusToggleText, value === 'group' && styles.statusToggleTextActive]}>Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChargeAssignScreen({ route, navigation }) {
  const { chargeId, fromNotification, isEditing } = route.params;
  const { state, assignCharge, flagAsGroup, flagAsPersonal, reassignCharge } = useApp();
  const { user } = state;

  // Edit mode: look in resolvedCharges. Normal mode: look in triageQueue
  const charge = isEditing
    ? state.resolvedCharges.find(c => c.id === chargeId)
    : state.triageQueue.find(c => c.id === chargeId);
  const activeTrips = state.activeTrips;

  // Auto-select trip: use charge's existing tripId, or auto-pick if only 1 trip active
  const defaultTripId = charge?.tripId
    || (activeTrips.length === 1 ? activeTrips[0].id : null);

  const [selectedTripId, setSelectedTripId] = useState(defaultTripId);
  const [selectedMembers, setSelectedMembers] = useState(
    charge?.assignedTo?.length > 0 ? charge.assignedTo : []
  );
  const [note, setNote] = useState(charge?.note || '');
  const [selectAll, setSelectAll] = useState(false);
  // Edit mode: allow toggling between 'personal' and 'group'
  const [chargeStatus, setChargeStatus] = useState(charge?.status || 'group');

  // Show quick banner only if arriving from notification and charge is still pending
  const [showQuickBanner, setShowQuickBanner] = useState(
    fromNotification && charge?.status === 'pending'
  );

  // The trip and its members update whenever selectedTripId changes
  const selectedTrip = activeTrips.find(t => t.id === selectedTripId);

  const handleTripSelect = (tripId) => {
    setSelectedTripId(tripId);
    setSelectedMembers([]); // reset member selection when switching trips
    setSelectAll(false);
  };

  const handleQuickJustMe = () => {
    // If multiple trips are active, always ask which trip — even if one is pre-selected
    if (activeTrips.length > 1) {
      Alert.alert(
        'Which trip?',
        `Tag this $${charge.amount.toFixed(2)} charge at ${charge.merchant} to:`,
        [
          ...activeTrips.map(trip => ({
            text: trip.name,
            onPress: () => {
              flagAsPersonal(chargeId, trip.id);
              navigation.goBack();
            },
          })),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    // Only 1 trip — resolve immediately
    flagAsPersonal(chargeId, activeTrips[0]?.id || selectedTripId);
    navigation.goBack();
  };

  const handleQuickGroup = () => {
    if (!selectedTripId) {
      Alert.alert('Pick a trip first', 'Which trip did this charge happen on?');
      return;
    }
    flagAsGroup(chargeId, selectedTripId);
    setShowQuickBanner(false);
  };

  if (!charge) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Charge not found — it may have been resolved already.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back to queue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const members = selectedTrip?.members || [];
  const catColor = CATEGORY_COLORS[charge.merchantCategory] || '#6B7280';
  const catIcon = CATEGORY_ICONS[charge.merchantCategory] || 'receipt';

  const toggleMember = (id) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
      setSelectAll(false);
    } else {
      setSelectedMembers(members.map(m => m.id));
      setSelectAll(true);
    }
  };

  const handleConfirm = () => {
    if (!selectedTripId && activeTrips.length > 1) {
      Alert.alert('Pick a trip first', 'Which trip did this charge happen on?');
      return;
    }
    if (chargeStatus === 'group' && selectedMembers.length === 0) {
      Alert.alert('Select at least one person', 'Who was part of this charge?');
      return;
    }
    const tripId = selectedTripId || activeTrips[0]?.id;

    // Auto-flip to personal if only "you" is selected on a group charge
    const onlyMeSelected =
      selectedMembers.length === 1 && selectedMembers[0] === user.id;
    const effectiveStatus = (chargeStatus === 'group' && onlyMeSelected)
      ? 'personal'
      : chargeStatus;

    const membersToSave = effectiveStatus === 'personal' ? [] : selectedMembers;

    if (isEditing) {
      reassignCharge(chargeId, effectiveStatus, membersToSave, note, tripId);
    } else {
      assignCharge(chargeId, membersToSave, note, tripId);
    }
    navigation.goBack();
  };

  const perPerson = selectedMembers.length > 0
    ? (charge.amount / selectedMembers.length).toFixed(2)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit charge' : 'Assign charge'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick Sort Banner — only visible when opened from notification */}
        {showQuickBanner && (
          <QuickSortBanner
            charge={charge}
            onJustMe={handleQuickJustMe}
            onGroup={handleQuickGroup}
          />
        )}

        {/* Charge Summary Card */}
        <View style={styles.chargeCard}>
          <View style={[styles.chargeIconWrap, { backgroundColor: catColor + '20' }]}>
            <Ionicons name={catIcon} size={26} color={catColor} />
          </View>
          <Text style={styles.chargeMerchant}>{charge.merchant}</Text>
          <Text style={styles.chargeAmount}>${charge.amount.toFixed(2)}</Text>
          <Text style={styles.chargeDate}>{charge.date} · ••{charge.card}</Text>
          {charge.isPending && (
            <View style={styles.pendingChip}>
              <Text style={styles.pendingChipText}>Amount may adjust — still pending at bank</Text>
            </View>
          )}
        </View>

        {/* Status Toggle — only in edit mode */}
        {isEditing && (
          <StatusToggle value={chargeStatus} onChange={setChargeStatus} />
        )}

        {/* Trip Picker */}
        <TripPicker
          trips={activeTrips}
          selectedTripId={selectedTripId}
          onSelect={handleTripSelect}
        />

        {/* Member Picker — hidden when status is 'Just Me' */}
        {chargeStatus !== 'personal' && <View style={[styles.section, !selectedTripId && { opacity: 0.35 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Who was there?</Text>
            <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllBtn}>
              <Text style={styles.selectAllText}>
                {selectedMembers.length === members.length ? 'Deselect all' : 'Select all'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.membersGrid}>
            {members.map(m => (
              <MemberAvatar
                key={m.id}
                member={m}
                selected={selectedMembers.includes(m.id)}
                onToggle={() => toggleMember(m.id)}
              />
            ))}
          </View>

          {perPerson && (
            <View style={styles.perPersonBanner}>
              <Ionicons name="calculator-outline" size={14} color={COLORS.primary} />
              <Text style={styles.perPersonText}>
                ${perPerson} per person · {selectedMembers.length} people
              </Text>
            </View>
          )}
        </View>}

        {/* Split Preview — only for group charges */}
        {chargeStatus !== 'personal' && <SplitPreview
          charge={charge}
          selectedMembers={selectedMembers}
          allMembers={members}
        />}

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a note</Text>
          <View style={styles.noteInputWrap}>
            <Ionicons name="create-outline" size={16} color={COLORS.textSoft} style={{ marginRight: 8, marginTop: 1 }} />
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. pre-dinner drinks"
              placeholderTextColor={COLORS.textSoft}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, chargeStatus === 'group' && selectedMembers.length === 0 && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.confirmBtnText}>
            {isEditing
              ? 'Save changes'
              : selectedMembers.length > 0
                ? `Confirm · ${selectedMembers.length} ${selectedMembers.length === 1 ? 'person' : 'people'}`
                : 'Select people to confirm'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  closeBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },

  // Charge card
  chargeCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  chargeIconWrap: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  chargeMerchant: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  chargeAmount: { fontSize: 36, fontWeight: '900', color: COLORS.text, letterSpacing: -1, marginBottom: 4 },
  chargeDate: { fontSize: 13, color: COLORS.textSoft },
  pendingChip: {
    marginTop: 10, backgroundColor: '#FEF3C7',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  pendingChipText: { fontSize: 12, color: '#92400E', fontWeight: '500' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  selectAllBtn: { padding: 4 },
  selectAllText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Members grid
  membersGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 16,
    justifyContent: 'flex-start',
  },
  memberWrap: { alignItems: 'center', width: 68 },
  memberAvatar: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  memberAvatarSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  memberInitial: { fontSize: 20, fontWeight: '800', color: COLORS.textSoft },
  memberInitialSelected: { color: COLORS.primary },
  checkBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.white,
  },
  memberName: { fontSize: 12, color: COLORS.textSoft, marginTop: 6, fontWeight: '500', textAlign: 'center' },
  memberNameSelected: { color: COLORS.primary, fontWeight: '700' },

  // Per person
  perPersonBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, marginTop: 16,
  },
  perPersonText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },

  // Split preview
  splitPreview: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  splitTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSoft, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  splitRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  splitAvatarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  splitAvatar: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  splitAvatarText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  splitName: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  splitAmount: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  splitTotal: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 2,
  },
  splitTotalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSoft },
  splitTotalAmount: { fontSize: 16, fontWeight: '800', color: COLORS.text },

  // Note
  noteInputWrap: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border, padding: 14,
  },
  noteInput: { flex: 1, fontSize: 15, color: COLORS.text, minHeight: 40 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white,
    padding: 20, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    padding: 17, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#C4B5FD' },
  confirmBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Not found
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  notFoundText: { fontSize: 16, color: COLORS.textSoft, textAlign: 'center', marginBottom: 16 },
  backLink: {},
  backLinkText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },

  // Status Toggle
  statusToggleRow: { flexDirection: 'row', gap: 10 },
  statusToggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: '#F9FAFB',
  },
  statusToggleBtnActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  statusToggleText: { fontSize: 15, fontWeight: '700', color: COLORS.textSoft },
  statusToggleTextActive: { color: COLORS.white },

  // Trip Picker
  tripPickerGrid: { gap: 10 },
  tripPickerCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: 14,
  },
  tripPickerCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tripPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tripPickerIcon: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  tripPickerIconSelected: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tripPickerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  tripPickerNameSelected: { color: '#fff' },
  tripPickerMeta: { fontSize: 12, color: COLORS.textSoft, marginTop: 1 },
  tripPickerMetaSelected: { color: 'rgba(255,255,255,0.7)' },

  // Quick Sort Banner
  quickBanner: {
    backgroundColor: COLORS.white,
    borderRadius: 18, padding: 16, marginBottom: 20,
    borderWidth: 1.5, borderColor: '#FDE68A',
    shadowColor: COLORS.warning, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  quickBannerTop: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14,
  },
  quickBannerIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.warningLight,
    alignItems: 'center', justifyContent: 'center',
  },
  quickBannerTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.textSoft,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3,
  },
  quickBannerSub: {
    fontSize: 14, color: COLORS.textSoft, lineHeight: 20,
  },
  quickBannerActions: {
    flexDirection: 'row', gap: 10,
  },
  quickJustMeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12, paddingVertical: 13,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  quickJustMeText: { fontSize: 15, fontWeight: '700', color: COLORS.textSoft },
  quickBtnHint: { fontSize: 12, color: COLORS.textSoft },

  quickGroupBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  quickGroupText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  quickGroupHint: { fontSize: 12, color: '#C4B5FD' },
});
