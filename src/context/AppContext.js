import React, { createContext, useContext, useReducer, useEffect } from 'react';

// expo-notifications is optional — only active after `npm install expo-notifications`
let Notifications = null;
try { Notifications = require('expo-notifications'); } catch (_) {}
import {
  MOCK_USER,
  MOCK_ACTIVE_TRIP,
  MOCK_TRIAGE_QUEUE,
  MOCK_RESOLVED_CHARGES,
  MOCK_PAST_TRIPS,
} from '../data/mockData';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  isOnboarded: false,        // set to true to skip onboarding in dev
  user: MOCK_USER,
  activeTrips: MOCK_ACTIVE_TRIP ? [MOCK_ACTIVE_TRIP] : [],  // array of active trips
  triageQueue: MOCK_TRIAGE_QUEUE,
  resolvedCharges: MOCK_RESOLVED_CHARGES,
  pastTrips: MOCK_PAST_TRIPS,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
const actions = {
  COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',
  FLAG_AS_GROUP: 'FLAG_AS_GROUP',
  FLAG_AS_PERSONAL: 'FLAG_AS_PERSONAL',
  ASSIGN_CHARGE: 'ASSIGN_CHARGE',
  REASSIGN_CHARGE: 'REASSIGN_CHARGE',
  UPDATE_CHARGE_NOTE: 'UPDATE_CHARGE_NOTE',
  END_TRIP: 'END_TRIP',
  START_TRIP: 'START_TRIP',
  ADD_CARD: 'ADD_CARD',
  REMOVE_CARD: 'REMOVE_CARD',
  SIMULATE_NEW_CHARGE: 'SIMULATE_NEW_CHARGE',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case actions.COMPLETE_ONBOARDING:
      return { ...state, isOnboarded: true };

    case actions.FLAG_AS_PERSONAL: {
      const { chargeId, tripId } = action.payload;
      const charge = state.triageQueue.find(c => c.id === chargeId);
      if (!charge) return state;
      // Always preserve the charge's own tripId if no override is provided
      const resolvedTripId = tripId || charge.tripId
        || state.activeTrips[0]?.id || null;
      // Bug fix: set splitAmount so personal charges are consistent with group ones
      const resolved = { ...charge, status: 'personal', tripId: resolvedTripId, splitAmount: charge.amount, assignedTo: [] };
      return {
        ...state,
        triageQueue: state.triageQueue.filter(c => c.id !== chargeId),
        resolvedCharges: [...state.resolvedCharges, resolved],
      };
    }

    case actions.FLAG_AS_GROUP: {
      const { chargeId, tripId } = action.payload;
      return {
        ...state,
        triageQueue: state.triageQueue.map(c => {
          if (c.id !== chargeId) return c;
          // Always preserve the charge's own tripId if no override is provided
          const resolvedTripId = tripId || c.tripId
            || state.activeTrips[0]?.id || null;
          return { ...c, status: 'group', tripId: resolvedTripId };
        }),
      };
    }

    case actions.ASSIGN_CHARGE: {
      const { chargeId, memberIds, note, tripId } = action.payload;
      const charge = state.triageQueue.find(c => c.id === chargeId);
      if (!charge) return state;
      const perPerson = memberIds.length > 0
        ? parseFloat((charge.amount / memberIds.length).toFixed(2))
        : charge.amount;
      const resolved = {
        ...charge,
        status: 'group',
        assignedTo: memberIds,
        note: note ?? charge.note,
        splitAmount: perPerson,
        tripId: tripId || charge.tripId,
      };
      return {
        ...state,
        triageQueue: state.triageQueue.filter(c => c.id !== chargeId),
        resolvedCharges: [...state.resolvedCharges, resolved],
      };
    }

    case actions.REASSIGN_CHARGE: {
      const { chargeId, status, memberIds, note, tripId } = action.payload;
      return {
        ...state,
        resolvedCharges: state.resolvedCharges.map(c => {
          if (c.id !== chargeId) return c;
          // Bug fix: personal charges must always have empty assignedTo
          // regardless of what was passed in — old group members must be cleared
          const resolvedMembers = status === 'personal' ? [] : memberIds;
          const perPerson = resolvedMembers.length > 0
            ? parseFloat((c.amount / resolvedMembers.length).toFixed(2))
            : c.amount;
          return {
            ...c,
            status,
            assignedTo: resolvedMembers,
            note: note ?? c.note,
            splitAmount: status === 'group' ? perPerson : c.amount,
            tripId: tripId || c.tripId,
          };
        }),
      };
    }

    case actions.UPDATE_CHARGE_NOTE: {
      // Bug fix: update note in both triageQueue AND resolvedCharges
      const { chargeId, note } = action.payload;
      return {
        ...state,
        triageQueue: state.triageQueue.map(c =>
          c.id === chargeId ? { ...c, note } : c
        ),
        resolvedCharges: state.resolvedCharges.map(c =>
          c.id === chargeId ? { ...c, note } : c
        ),
      };
    }

    case actions.END_TRIP: {
      const tripId = action.payload;
      const trip = state.activeTrips.find(t => t.id === tripId);
      if (!trip) return state;
      const ended = {
        ...trip,
        endDate: new Date().toISOString().split('T')[0],
        status: 'ended',
      };
      return {
        ...state,
        activeTrips: state.activeTrips.filter(t => t.id !== tripId),
        pastTrips: [ended, ...state.pastTrips],
        // Remove unsorted charges that belonged to this trip
        triageQueue: state.triageQueue.filter(c => c.tripId !== tripId),
      };
    }

    case actions.START_TRIP: {
      const { name, startDate, endDate, members } = action.payload;
      const newTrip = {
        id: `trip_${Date.now()}`,
        name,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || null,
        members,
        status: 'active',
      };
      return {
        ...state,
        activeTrips: [...state.activeTrips, newTrip],
        // Don't clear queue — other trips' charges stay
      };
    }

    case actions.SIMULATE_NEW_CHARGE: {
      // payload is a pre-built charge object from the async action creator
      return {
        ...state,
        triageQueue: [action.payload, ...state.triageQueue],
      };
    }

    case actions.ADD_CARD: {
      const newCard = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          connectedCards: [...state.user.connectedCards, newCard],
        },
      };
    }

    case actions.REMOVE_CARD: {
      return {
        ...state,
        user: {
          ...state.user,
          connectedCards: state.user.connectedCards.filter(c => c.id !== action.payload),
        },
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

const MOCK_MERCHANTS = [
  { name: 'TAO Downtown', category: 'Restaurant', amount: 312.40 },
  { name: 'Lyft', category: 'Transport', amount: 18.50 },
  { name: 'Eataly', category: 'Restaurant', amount: 94.20 },
  { name: 'Sephora', category: 'Shopping', amount: 67.00 },
  { name: 'The High Line', category: 'Activities', amount: 22.00 },
];

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ─── Notification setup (permissions + category + foreground handler) ───────
  useEffect(() => {
    if (!Notifications) return;

    // 1. Show notifications even when the app is open in the foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // 2. Ask the user for permission to send notifications
    Notifications.requestPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') {
        console.log('Notification permission not granted');
      }
    });

    // 3. Register the "CHARGE_TRIAGE" category with Group + Just Me buttons
    //    These are the two buttons that appear on the lock screen / home screen
    Notifications.setNotificationCategoryAsync('CHARGE_TRIAGE', [
      {
        identifier: 'GROUP',
        buttonTitle: '👥 Group',
        options: { opensAppToForeground: false }, // user can reply without opening app
      },
      {
        identifier: 'JUST_ME',
        buttonTitle: '🙋 Just Me',
        options: { opensAppToForeground: false },
      },
    ]);
  }, []);

  // ─── Notification response listener ────────────────────────────────────────
  useEffect(() => {
    if (!Notifications) return;
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const { chargeId } = response.notification.request.content.data || {};
      if (!chargeId) return;
      const actionId = response.actionIdentifier;
      // Bug fix: don't pass tripId: null — let the reducer use the charge's
      // existing tripId so the charge always shows up in the correct trip's stats
      if (actionId === 'GROUP') {
        dispatch({ type: actions.FLAG_AS_GROUP, payload: { chargeId } });
      } else if (actionId === 'JUST_ME') {
        dispatch({ type: actions.FLAG_AS_PERSONAL, payload: { chargeId } });
      }
    });
    return () => sub.remove();
  }, []);

  const simulateNewCharge = async () => {
    const m = MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)];
    const chargeId = `charge_${Date.now()}`;
    const newCharge = {
      id: chargeId,
      merchant: m.name,
      merchantCategory: m.category,
      amount: m.amount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      card: state.user.connectedCards[0]?.last4 || '0000',
      tripId: state.activeTrips[0]?.id || null,  // assign to first active trip by default
      status: 'pending',
      assignedTo: [],
      note: '',
      isPending: Math.random() > 0.7,
    };
    dispatch({ type: actions.SIMULATE_NEW_CHARGE, payload: newCharge });

    // Fire push notification if expo-notifications is available
    if (Notifications) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${m.name}  ·  $${m.amount.toFixed(2)}`,
            body: 'Group expense or just you?',
            categoryIdentifier: 'CHARGE_TRIAGE',
            data: { chargeId },
          },
          trigger: null, // fire immediately
        });
      } catch (e) {
        console.log('Notification error:', e);
      }
    }
  };

  const ctx = {
    state,
    completeOnboarding: () => dispatch({ type: actions.COMPLETE_ONBOARDING }),
    flagAsGroup: (chargeId, tripId) => dispatch({ type: actions.FLAG_AS_GROUP, payload: { chargeId, tripId } }),
    flagAsPersonal: (chargeId, tripId) => dispatch({ type: actions.FLAG_AS_PERSONAL, payload: { chargeId, tripId } }),
    assignCharge: (chargeId, memberIds, note, tripId) =>
      dispatch({ type: actions.ASSIGN_CHARGE, payload: { chargeId, memberIds, note, tripId } }),
    reassignCharge: (chargeId, status, memberIds, note, tripId) =>
      dispatch({ type: actions.REASSIGN_CHARGE, payload: { chargeId, status, memberIds, note, tripId } }),
    updateChargeNote: (chargeId, note) =>
      dispatch({ type: actions.UPDATE_CHARGE_NOTE, payload: { chargeId, note } }),
    endTrip: (tripId) => dispatch({ type: actions.END_TRIP, payload: tripId }),
    startTrip: ({ name, startDate, endDate, members }) =>
      dispatch({ type: actions.START_TRIP, payload: { name, startDate, endDate, members } }),
    simulateNewCharge,
    addCard: (card) => dispatch({ type: actions.ADD_CARD, payload: card }),
    removeCard: (cardId) => dispatch({ type: actions.REMOVE_CARD, payload: cardId }),
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
