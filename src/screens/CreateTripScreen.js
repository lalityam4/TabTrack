import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal,
  FlatList, Share, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useApp } from '../context/AppContext';

const COLORS = {
  primary: '#5B4CF5',
  primaryLight: '#EDE9FE',
  bg: '#F5F6FA',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textSoft: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  rangeHighlight: '#EDE9FE',
  success: '#10B981',
  successLight: '#D1FAE5',
};

const AVATAR_COLORS = [
  '#5B4CF5', '#10B981', '#F59E0B', '#EF4444',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F97316',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getInitials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatDisplay(date) {
  if (!date) return '';
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatISO(date) {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBetween(date, start, end) {
  if (!start || !end) return false;
  return date.getTime() > start.getTime() && date.getTime() < end.getTime();
}

// ─── Calendar Picker ──────────────────────────────────────────────────────────
function CalendarPicker({ startDate, endDate, onSelectStart, onSelectEnd, onClose, selecting }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const handleDayPress = (date) => {
    if (selecting === 'start') {
      onSelectStart(date);
      if (endDate && date > endDate) onSelectEnd(null);
    } else {
      if (startDate && date < startDate) { onSelectStart(date); onSelectEnd(null); }
      else onSelectEnd(date);
    }
  };

  const getDayStyle = (date) => {
    if (!date) return {};
    const isStart = sameDay(date, startDate);
    const isEnd = sameDay(date, endDate);
    const inRange = isBetween(date, startDate, endDate);
    if (isStart || isEnd) return { bg: COLORS.primary, text: '#fff', bold: true };
    if (inRange) return { bg: COLORS.rangeHighlight, text: COLORS.primary, bold: false };
    return { bg: 'transparent', text: COLORS.text, bold: false };
  };

  return (
    <View style={calStyles.container}>
      <View style={calStyles.monthRow}>
        <TouchableOpacity onPress={goToPrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={calStyles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={goToNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-forward" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <View style={calStyles.weekRow}>
        {DAYS_OF_WEEK.map(d => <Text key={d} style={calStyles.weekDay}>{d}</Text>)}
      </View>
      <View style={calStyles.grid}>
        {cells.map((date, idx) => {
          if (!date) return <View key={`e-${idx}`} style={calStyles.cell} />;
          const style = getDayStyle(date);
          const isStart = sameDay(date, startDate);
          const isEnd = sameDay(date, endDate);
          return (
            <TouchableOpacity key={idx} style={calStyles.cell} onPress={() => handleDayPress(date)} activeOpacity={0.7}>
              <View style={[calStyles.dayCircle, style.bg !== 'transparent' && { backgroundColor: style.bg }, (isStart || isEnd) && calStyles.selectedCircle]}>
                <Text style={[calStyles.dayText, { color: style.text }, style.bold && { fontWeight: '700' }]}>
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={calStyles.hint}>
        {selecting === 'start' ? '👆 Tap a day to set your start date' : '👆 Tap a day to set your end date'}
      </Text>
      <TouchableOpacity style={calStyles.doneBtn} onPress={onClose}>
        <Text style={calStyles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Contacts Picker Modal ────────────────────────────────────────────────────
function ContactsModal({ visible, onClose, onSelect, alreadyAdded }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) loadContacts();
  }, [visible]);

  const loadContacts = async () => {
    setLoading(true);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Contacts permission needed',
        'Allow TabTrack to access your contacts in Settings so you can add friends to trips.',
        [{ text: 'OK' }]
      );
      onClose();
      setLoading(false);
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      sort: Contacts.SortTypes.FirstName,
    });
    // Only show contacts with a name
    const valid = data.filter(c => c.name && c.name.trim().length > 0);
    setContacts(valid);
    setLoading(false);
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const isAlreadyAdded = (contact) =>
    alreadyAdded.some(m => m.phone === contact.phoneNumbers?.[0]?.number || m.name === contact.name);

  const renderContact = ({ item }) => {
    const added = isAlreadyAdded(item);
    const initials = getInitials(item.name);
    const color = getAvatarColor(item.id || item.name);
    const phone = item.phoneNumbers?.[0]?.number || null;

    return (
      <TouchableOpacity
        style={[styles.contactRow, added && styles.contactRowAdded]}
        onPress={() => !added && onSelect({ name: item.name, phone, initials, color })}
        activeOpacity={added ? 1 : 0.7}
      >
        <View style={[styles.contactAvatar, { backgroundColor: color + '20' }]}>
          <Text style={[styles.contactAvatarText, { color }]}>{initials}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          {phone && <Text style={styles.contactPhone}>{phone}</Text>}
        </View>
        {added
          ? <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
          : <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
        }
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.contactsModal}>
        {/* Header */}
        <View style={styles.contactsHeader}>
          <Text style={styles.contactsTitle}>Add from Contacts</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={26} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.contactsSearch}>
          <Ionicons name="search" size={16} color={COLORS.textSoft} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.contactsSearchInput}
            placeholder="Search contacts..."
            placeholderTextColor={COLORS.textSoft}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textSoft} />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.contactsLoading}>
            <Text style={styles.contactsLoadingText}>Loading contacts...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id || item.name}
            renderItem={renderContact}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.contactsEmpty}>
                <Text style={styles.contactsEmptyText}>
                  {search ? `No contacts matching "${search}"` : 'No contacts found'}
                </Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border }} />}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Member Bubble ────────────────────────────────────────────────────────────
function MemberBubble({ member, onRemove }) {
  const color = getAvatarColor(member.id);
  return (
    <View style={styles.memberItem}>
      <View style={[styles.memberAvatar, { backgroundColor: color + '20' }]}>
        <Text style={[styles.memberAvatarText, { color }]}>{member.initials}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.isYou ? `${member.name} (you)` : member.name}</Text>
        {member.phone && <Text style={styles.memberPhone}>{member.phone}</Text>}
        {member.fromContacts && (
          <View style={styles.fromContactsBadge}>
            <Ionicons name="person-circle-outline" size={11} color={COLORS.success} />
            <Text style={styles.fromContactsBadgeText}>From Contacts</Text>
          </View>
        )}
      </View>
      {!member.isYou && (
        <TouchableOpacity onPress={() => onRemove(member.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={20} color={COLORS.textSoft} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Create Trip Screen ───────────────────────────────────────────────────────
export default function CreateTripScreen({ navigation }) {
  const { state, startTrip } = useApp();
  const { user } = state;

  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [members, setMembers] = useState([
    { id: user.id, name: user.name, initials: getInitials(user.name), isYou: true },
  ]);
  const [addingPerson, setAddingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selecting, setSelecting] = useState('start');
  const [contactsVisible, setContactsVisible] = useState(false);

  const canCreate = tripName.trim().length > 0;

  const openCalendar = (field) => { setSelecting(field); setCalendarVisible(true); };

  const handleAddPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;
    const id = `member_${Date.now()}`;
    setMembers(prev => [...prev, { id, name, initials: getInitials(name), isYou: false }]);
    setNewPersonName('');
    setAddingPerson(false);
  };

  const handleAddFromContact = (contact) => {
    // Avoid duplicates
    const alreadyExists = members.some(m => m.name === contact.name || (contact.phone && m.phone === contact.phone));
    if (alreadyExists) return;
    const id = `member_${Date.now()}`;
    setMembers(prev => [...prev, {
      id,
      name: contact.name,
      initials: contact.initials,
      phone: contact.phone,
      isYou: false,
      fromContacts: true,
    }]);
  };

  const handleRemoveMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleShareLink = async () => {
    const tripNameText = tripName.trim() || 'our trip';
    try {
      await Share.share({
        message: `Hey! ${user.name} is inviting you to join "${tripNameText}" on TabTrack. Download the app and use this link to join: https://tabtrack.app/join/trip_${Date.now()}`,
        title: `Join ${tripNameText} on TabTrack`,
      });
    } catch (e) {
      // User dismissed the share sheet — do nothing
    }
  };

  const handleCreate = () => {
    if (!canCreate) return;
    startTrip({
      name: tripName.trim(),
      startDate: formatISO(startDate) || new Date().toISOString().split('T')[0],
      endDate: formatISO(endDate) || null,
      members,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={26} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Trip Name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TRIP NAME</Text>
            <TextInput
              style={styles.nameInput}
              value={tripName}
              onChangeText={setTripName}
              placeholder="e.g. Cabo May 2026"
              placeholderTextColor={COLORS.textSoft}
              autoFocus
              returnKeyType="next"
            />
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DATES</Text>
            <View style={styles.datesRow}>
              <TouchableOpacity style={styles.dateField} onPress={() => openCalendar('start')} activeOpacity={0.7}>
                <Text style={styles.dateLabel}>From</Text>
                <View style={styles.dateValueRow}>
                  <Ionicons name="calendar-outline" size={14} color={startDate ? COLORS.primary : COLORS.textSoft} style={{ marginRight: 5 }} />
                  <Text style={[styles.dateValue, !startDate && styles.datePlaceholder]}>
                    {startDate ? formatDisplay(startDate) : 'Start date'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.dateDivider}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.textSoft} />
              </View>
              <TouchableOpacity style={styles.dateField} onPress={() => openCalendar('end')} activeOpacity={0.7}>
                <Text style={styles.dateLabel}>To</Text>
                <View style={styles.dateValueRow}>
                  <Ionicons name="calendar-outline" size={14} color={endDate ? COLORS.primary : COLORS.textSoft} style={{ marginRight: 5 }} />
                  <Text style={[styles.dateValue, !endDate && styles.datePlaceholder]}>
                    {endDate ? formatDisplay(endDate) : 'End date'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.datesHint}>Optional — you can always end the trip manually</Text>
          </View>

          {/* People */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHO'S COMING</Text>

            {/* Members List */}
            <View style={styles.membersCard}>
              {members.map(m => (
                <MemberBubble key={m.id} member={m} onRemove={handleRemoveMember} />
              ))}

              {/* Manual name input */}
              {addingPerson ? (
                <View style={styles.addPersonRow}>
                  <TextInput
                    style={styles.addPersonInput}
                    value={newPersonName}
                    onChangeText={setNewPersonName}
                    placeholder="Type a name"
                    placeholderTextColor={COLORS.textSoft}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleAddPerson}
                  />
                  <TouchableOpacity
                    style={[styles.addPersonConfirm, !newPersonName.trim() && { opacity: 0.4 }]}
                    onPress={handleAddPerson}
                  >
                    <Text style={styles.addPersonConfirmText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setAddingPerson(false); setNewPersonName(''); }} style={{ marginLeft: 8 }}>
                    <Ionicons name="close" size={20} color={COLORS.textSoft} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addPersonBtn} onPress={() => setAddingPerson(true)} activeOpacity={0.75}>
                  <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.addPersonBtnText}>Type a name</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Add from Contacts + Share Link buttons */}
            <View style={styles.inviteRow}>
              <TouchableOpacity style={styles.inviteBtn} onPress={() => setContactsVisible(true)} activeOpacity={0.8}>
                <View style={styles.inviteBtnIcon}>
                  <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.inviteBtnText}>
                  <Text style={styles.inviteBtnTitle}>From Contacts</Text>
                  <Text style={styles.inviteBtnSub}>Pick from your phone</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inviteBtn, { borderColor: COLORS.success + '60' }]}
                onPress={handleShareLink}
                activeOpacity={0.8}
              >
                <View style={[styles.inviteBtnIcon, { backgroundColor: COLORS.successLight }]}>
                  <Ionicons name="link-outline" size={18} color={COLORS.success} />
                </View>
                <View style={styles.inviteBtnText}>
                  <Text style={[styles.inviteBtnTitle, { color: COLORS.success }]}>Share Link</Text>
                  <Text style={styles.inviteBtnSub}>Invite via iMessage etc.</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.peopleHint}>
              {members.length - 1 === 0
                ? 'Add people to pre-fill the group'
                : `${members.length - 1} ${members.length - 1 === 1 ? 'person' : 'people'} added`}
            </Text>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
            onPress={handleCreate}
            activeOpacity={0.85}
            disabled={!canCreate}
          >
            <Ionicons name="airplane" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.createBtnText}>
              Start Trip{members.length > 1 ? ` with ${members.length} people` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Calendar Modal */}
      <Modal visible={calendarVisible} animationType="slide" transparent onRequestClose={() => setCalendarVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCalendarVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.calendarTabRow}>
              <TouchableOpacity
                style={[styles.calendarTab, selecting === 'start' && styles.calendarTabActive]}
                onPress={() => setSelecting('start')}
              >
                <Text style={[styles.calendarTabText, selecting === 'start' && styles.calendarTabTextActive]}>Start Date</Text>
                {startDate && <Text style={[styles.calendarTabDate, selecting === 'start' && { color: COLORS.primary }]}>{formatDisplay(startDate)}</Text>}
              </TouchableOpacity>
              <View style={{ width: 1, backgroundColor: COLORS.border, marginVertical: 8 }} />
              <TouchableOpacity
                style={[styles.calendarTab, selecting === 'end' && styles.calendarTabActive]}
                onPress={() => setSelecting('end')}
              >
                <Text style={[styles.calendarTabText, selecting === 'end' && styles.calendarTabTextActive]}>End Date</Text>
                {endDate && <Text style={[styles.calendarTabDate, selecting === 'end' && { color: COLORS.primary }]}>{formatDisplay(endDate)}</Text>}
              </TouchableOpacity>
            </View>
            <CalendarPicker
              startDate={startDate}
              endDate={endDate}
              onSelectStart={setStartDate}
              onSelectEnd={setEndDate}
              onClose={() => setCalendarVisible(false)}
              selecting={selecting}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Contacts Modal */}
      <ContactsModal
        visible={contactsVisible}
        onClose={() => setContactsVisible(false)}
        onSelect={(contact) => { handleAddFromContact(contact); }}
        alreadyAdded={members}
      />
    </SafeAreaView>
  );
}

// ─── Calendar Styles ──────────────────────────────────────────────────────────
const calStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 8 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  monthTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: COLORS.textSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  selectedCircle: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  dayText: { fontSize: 14, color: COLORS.text },
  hint: { textAlign: 'center', fontSize: 12, color: COLORS.textSoft, marginTop: 12, marginBottom: 4 },
  doneBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, marginTop: 12, marginBottom: 4, alignItems: 'center' },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSoft, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },

  // Name
  nameInput: {
    backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 20, fontWeight: '700', color: COLORS.text,
  },

  // Dates
  datesRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, overflow: 'hidden' },
  dateField: { flex: 1, padding: 14 },
  dateLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSoft, marginBottom: 6 },
  dateValueRow: { flexDirection: 'row', alignItems: 'center' },
  dateValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  datePlaceholder: { color: COLORS.textSoft, fontWeight: '400' },
  dateDivider: { paddingHorizontal: 4, borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border, paddingVertical: 20 },
  datesHint: { fontSize: 12, color: COLORS.textSoft, marginTop: 8 },

  // Members card
  membersCard: { backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 6, marginBottom: 12 },
  memberItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  memberAvatar: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarText: { fontSize: 14, fontWeight: '800' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  memberPhone: { fontSize: 12, color: COLORS.textSoft, marginTop: 1 },
  fromContactsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  fromContactsBadgeText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },

  addPersonBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  addPersonBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  addPersonRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  addPersonInput: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text, paddingVertical: 4 },
  addPersonConfirm: { backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  addPersonConfirmText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Invite row
  inviteRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  inviteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.primaryLight,
    padding: 12,
  },
  inviteBtnIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  inviteBtnText: { flex: 1 },
  inviteBtnTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  inviteBtnSub: { fontSize: 11, color: COLORS.textSoft, marginTop: 1 },
  peopleHint: { fontSize: 12, color: COLORS.textSoft, marginTop: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  calendarTabRow: { flexDirection: 'row', marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden' },
  calendarTab: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  calendarTabActive: { backgroundColor: COLORS.primaryLight },
  calendarTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSoft },
  calendarTabTextActive: { color: COLORS.primary },
  calendarTabDate: { fontSize: 11, color: COLORS.textSoft, marginTop: 2 },

  // Contacts modal
  contactsModal: { flex: 1, backgroundColor: COLORS.bg },
  contactsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  contactsTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  contactsSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, margin: 16, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 10 },
  contactsSearchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  contactsLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  contactsLoadingText: { fontSize: 15, color: COLORS.textSoft },
  contactsEmpty: { padding: 40, alignItems: 'center' },
  contactsEmptyText: { fontSize: 14, color: COLORS.textSoft, textAlign: 'center' },

  contactRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.white, gap: 12 },
  contactRowAdded: { opacity: 0.5 },
  contactAvatar: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactAvatarText: { fontSize: 15, fontWeight: '800' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  contactPhone: { fontSize: 13, color: COLORS.textSoft, marginTop: 1 },

  // Footer
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
  createBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  createBtnDisabled: { backgroundColor: '#C4B5FD', shadowOpacity: 0 },
  createBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
