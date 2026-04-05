# TabTrack v1.0

> Stop reconstructing expenses from memory. Your card swipe triggers the split.

## Running the app

### Prerequisites
- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **Expo Go** app on your iPhone — search "Expo Go" in the App Store

### Steps

```bash
# 1. Open Terminal and navigate to this folder
cd "Lali Portfolio/TabTrack"

# 2. Install dependencies (takes ~1 minute the first time)
npm install

# 3. Start the development server
npx expo start
```

A QR code will appear in the terminal. **Open Expo Go on your iPhone and scan it.** The app will load on your phone.

> If you see a prompt about "Metro bundler", just wait — it compiles on first launch.

---

## What's in v1

| Screen | What it does |
|--------|-------------|
| **Onboarding** | 4-step setup: connect card (mock Plaid), set home city, review how it works |
| **Queue (Home)** | Triage inbox — every charge gets "Group" or "Just me" |
| **Charge Assign** | Pick who was on the charge, see split preview, add a note |
| **Trips** | Active trip card + past trips list; start/end trips manually |
| **Trip Detail** | All charges for a trip, grouped vs. personal tabs |
| **Settlement** | Who owes what, itemized by charge, Venmo deep-link |
| **Settings** | Connected cards, home city, notification toggles |

## Simulating charges

On the Queue screen, tap the **"Simulate"** button (top-right) to add a fake new charge — this is how you'd experience the notification flow without a real Plaid connection.

## Mock data pre-loaded

The app opens with:
- An active **NYC Weekend** trip with Priya, Aarav, and Meera
- **5 pending charges** in the triage queue (Carbone, Uber, Russ & Daughters, MoMA, The Spotted Pig)
- **3 resolved charges** (JFK taxi, Whole Foods personal, Via bus)
- **2 past trips** (Miami New Year, LA Weekend)

---

## Architecture

```
src/
  context/AppContext.js   ← All state + actions (useReducer)
  data/mockData.js        ← Mock charges, trips, users
  navigation/             ← Tab + stack navigator setup
  screens/
    OnboardingScreen.js   ← 4-step first-run flow
    HomeScreen.js         ← Triage queue
    ChargeAssignScreen.js ← Member picker + split preview
    TripsScreen.js        ← Trip list
    TripDetailScreen.js   ← Trip charges + settlement entry
    SettlementScreen.js   ← Who owes what + Venmo links
    SettingsScreen.js     ← Cards, notifications, account
```

## What's mocked vs. real

| Feature | Status |
|---------|--------|
| Card connection (Plaid) | Mocked — simulated with alerts |
| Real-time charge notifications | Mocked — use Simulate button |
| Location-based trip detection | Configured in app.json; needs device |
| Venmo deep-link | Real — opens Venmo app/web |
| SMS text requests | Real — opens Messages |
| Share summary | Real — uses native share sheet |
| All navigation & state | Fully functional |

---

## Next steps (v2)

- Wire up real Plaid Link SDK
- Backend API for syncing trips across devices
- Push notifications via Expo Notifications + server
- Location-based auto trip detection
- Venmo/PayPal OAuth for one-tap requests
