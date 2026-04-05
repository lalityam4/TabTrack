// ─── Mock Data for TabTrack v1 ───────────────────────────────────────────────
// In production: card data comes from Plaid, users from your backend

export const MOCK_USER = {
  id: 'user_lali',
  name: 'Lali',
  email: 'lalitya.m4@gmail.com',
  avatar: 'L',
  homeCity: 'San Francisco, CA',
  homeLocation: { lat: 37.7749, lng: -122.4194 },
  connectedCards: [
    {
      id: 'card_1',
      last4: '4242',
      type: 'Visa',
      name: 'Chase Sapphire Reserve',
      bank: 'Chase',
      color: '#1A365D',
    },
    {
      id: 'card_2',
      last4: '8876',
      type: 'Mastercard',
      name: 'Amex Gold',
      bank: 'American Express',
      color: '#92400E',
    },
  ],
};

export const MOCK_MEMBERS = [
  { id: 'user_lali', name: 'Lali',  initials: 'L',  phone: null, isYou: true },
  { id: 'user_priya', name: 'Priya', initials: 'P',  phone: '+1 (555) 234-5678', isYou: false },
  { id: 'user_aarav', name: 'Aarav', initials: 'A',  phone: '+1 (555) 345-6789', isYou: false },
  { id: 'user_meera', name: 'Meera', initials: 'M',  phone: '+1 (555) 456-7890', isYou: false },
];

export const MOCK_ACTIVE_TRIP = {
  id: 'trip_nyc_2026',
  name: 'NYC Weekend',
  startDate: '2026-03-27',
  endDate: null, // null = still active
  members: MOCK_MEMBERS,
  status: 'active',
};

export const MOCK_TRIAGE_QUEUE = [
  {
    id: 'charge_001',
    merchant: 'Carbone',
    merchantCategory: 'Restaurant',
    amount: 243.50,
    date: '2026-03-29',
    time: '9:14 PM',
    card: '4242',
    tripId: 'trip_nyc_2026',
    status: 'pending', // 'pending' | 'group' | 'personal'
    assignedTo: [],
    note: '',
    isPending: false,
  },
  {
    id: 'charge_002',
    merchant: 'Uber',
    merchantCategory: 'Transport',
    amount: 34.80,
    date: '2026-03-29',
    time: '7:42 PM',
    card: '4242',
    tripId: 'trip_nyc_2026',
    status: 'pending',
    assignedTo: [],
    note: '',
    isPending: false,
  },
  {
    id: 'charge_003',
    merchant: 'Russ & Daughters',
    merchantCategory: 'Restaurant',
    amount: 68.00,
    date: '2026-03-29',
    time: '10:22 AM',
    card: '8876',
    tripId: 'trip_nyc_2026',
    status: 'pending',
    assignedTo: [],
    note: '',
    isPending: false,
  },
  {
    id: 'charge_004',
    merchant: 'MoMA',
    merchantCategory: 'Activities',
    amount: 100.00,
    date: '2026-03-28',
    time: '2:05 PM',
    card: '4242',
    tripId: 'trip_nyc_2026',
    status: 'pending',
    assignedTo: [],
    note: '',
    isPending: false,
  },
  {
    id: 'charge_005',
    merchant: 'The Spotted Pig',
    merchantCategory: 'Restaurant',
    amount: 187.20,
    date: '2026-03-28',
    time: '8:30 PM',
    card: '4242',
    tripId: 'trip_nyc_2026',
    status: 'pending',
    assignedTo: [],
    note: '',
    isPending: true, // Still pending at bank
  },
];

export const MOCK_RESOLVED_CHARGES = [
  {
    id: 'charge_r01',
    merchant: 'JFK Airport Taxi',
    merchantCategory: 'Transport',
    amount: 65.00,
    date: '2026-03-27',
    time: '3:15 PM',
    card: '4242',
    tripId: 'trip_nyc_2026',
    status: 'group',
    assignedTo: ['user_lali', 'user_priya', 'user_aarav', 'user_meera'],
    note: 'Airport taxi on arrival',
    isPending: false,
    splitAmount: 16.25,
  },
  {
    id: 'charge_r02',
    merchant: 'Whole Foods',
    merchantCategory: 'Groceries',
    amount: 43.50,
    date: '2026-03-27',
    time: '6:00 PM',
    card: '4242',
    tripId: 'trip_nyc_2026',
    status: 'personal',
    assignedTo: [],
    note: '',
    isPending: false,
    splitAmount: 43.50,
  },
  {
    id: 'charge_r03',
    merchant: 'Via Bus',
    merchantCategory: 'Transport',
    amount: 9.60,
    date: '2026-03-28',
    time: '11:30 AM',
    card: '4242',
    tripId: 'trip_nyc_2026',
    status: 'group',
    assignedTo: ['user_lali', 'user_priya'],
    note: '',
    isPending: false,
    splitAmount: 4.80,
  },
];

export const MOCK_PAST_TRIPS = [
  {
    id: 'trip_miami_2025',
    name: 'Miami New Year',
    startDate: '2024-12-29',
    endDate: '2025-01-03',
    members: [
      { id: 'user_lali',  name: 'Lali',  initials: 'L', isYou: true },
      { id: 'user_priya', name: 'Priya', initials: 'P', isYou: false },
      { id: 'user_aarav', name: 'Aarav', initials: 'A', isYou: false },
    ],
    status: 'settled',
    totalSpend: 1842.00,
    yourSpend: 714.00,
    youAreOwed: 228.00,
  },
  {
    id: 'trip_la_2025',
    name: 'LA Weekend',
    startDate: '2025-09-12',
    endDate: '2025-09-14',
    members: [
      { id: 'user_lali',  name: 'Lali',  initials: 'L', isYou: true },
      { id: 'user_meera', name: 'Meera', initials: 'M', isYou: false },
    ],
    status: 'settled',
    totalSpend: 622.00,
    yourSpend: 390.00,
    youAreOwed: 79.00,
  },
];

// Category icon map
export const CATEGORY_ICONS = {
  Restaurant: 'restaurant',
  Transport: 'car',
  Activities: 'camera',
  Groceries: 'basket',
  Accommodation: 'bed',
  Shopping: 'bag',
  Other: 'receipt',
};

// Category color map
export const CATEGORY_COLORS = {
  Restaurant: '#F59E0B',
  Transport: '#3B82F6',
  Activities: '#8B5CF6',
  Groceries: '#10B981',
  Accommodation: '#EC4899',
  Shopping: '#F97316',
  Other: '#6B7280',
};
