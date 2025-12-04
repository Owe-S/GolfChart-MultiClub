# Quick Reference Guide for Developers

## Setup & Development

### First Time Setup
```bash
# Clone and install
git clone <repo-url>
cd GolfChartAppV0.9
npm install
cd admin && npm install && cd ..

# Configure Firebase
firebase login
firebase use golfbilkontroll-skigk
```

### Start Development Servers

**Terminal 1 - User App:**
```bash
npm run dev
# Opens http://localhost:5173
```

**Terminal 2 - Admin App:**
```bash
cd admin
npm run dev
# Opens http://localhost:5174
```

**Terminal 3 - Firebase Emulators (optional):**
```bash
firebase emulators:start
# Firestore: http://localhost:8080
# Functions: http://localhost:5001
# UI: http://localhost:4000
```

---

## Key Files & Locations

| File | Purpose | Notes |
|------|---------|-------|
| `src/UserApp.tsx` | Main user app component | Entry point, booking flow |
| `src/components/Calendar.tsx` | Date selection | Month navigation |
| `src/components/AvailabilityGrid.tsx` | 54-slot grid | Real-time availability |
| `src/components/BookingForm.tsx` | Booking form | Auto-calc duration |
| `src/types.ts` | User app types | Rental, GolfCart interfaces |
| `admin/src/App.tsx` | Admin routing | Page routes, React Router |
| `admin/src/pages/BookingsListPage.tsx` | Bookings list | Cancellation feature |
| `admin/src/pages/RentalStatisticsPage.tsx` | Statistics | Player/cart stats |
| `admin/src/types.ts` | Admin types | Rental interface with cancellation |
| `firebase.json` | Firebase config | Hosting, emulator setup |
| `firestore.rules` | Security rules | Read/write permissions |
| `docs/ARCHITECTURE.md` | System design | Data flow, diagrams |
| `docs/FEATURES.md` | Feature details | User/admin features |
| `CHANGELOG.md` | Release notes | What's new |

---

## Common Tasks

### Add a New Admin Page

1. Create `admin/src/pages/NewPage.tsx`
```tsx
import { useState, useEffect } from 'react';
import '../ski-gk-theme.css';

function NewPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Page Title</h1>
      </div>
      {/* Content here */}
    </div>
  );
}

export default NewPage;
```

2. Add route in `admin/src/App.tsx`
```tsx
import NewPage from './pages/NewPage';

<Route path="path" element={<NewPage />} />
```

3. Add nav item in `admin/src/layouts/AdminLayout.tsx`
```tsx
{ path: '/path', label: 'Label', icon: '📊' }
```

### Query Rentals from Firestore

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Get all rentals
const rentalsRef = collection(db, 'rentals');
const snapshot = await getDocs(rentalsRef);
const rentals = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// Get specific cart's rentals
const q = query(
  collection(db, 'rentals'),
  where('cartId', '==', 1)
);
const snapshot = await getDocs(q);

// Real-time listener
import { onSnapshot } from 'firebase/firestore';

onSnapshot(query, (snapshot) => {
  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setRentals(data);
});
```

### Update Rental Status (Cancellation)

```typescript
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const rentalRef = doc(db, 'rentals', rentalId);
await updateDoc(rentalRef, {
  status: 'cancelled',
  cancelledAt: Timestamp.now(),
  cancellationReason: 'Player is sick'
});
```

### Create New Rental

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const rentalsRef = collection(db, 'rentals');
await addDoc(rentalsRef, {
  cartId: 1,
  renterName: 'John Doe',
  playerId: '073-1234567',
  holes: 18,
  startTime: Timestamp.fromDate(new Date('2025-12-04T10:00:00')),
  endTime: Timestamp.fromDate(new Date('2025-12-04T14:20:00')),
  chargingEndTime: Timestamp.fromDate(new Date('2025-12-04T15:10:00')),
  phone: '98765432',
  email: 'john@example.com',
  notes: 'Special request',
  price: 450,
  status: 'confirmed',
  createdAt: Timestamp.now()
});
```

---

## TypeScript Types Quick Reference

### User App
```typescript
// GolfCart
interface GolfCart {
  id: number;
  name: string;
  status: string;
}

// Rental (user app version)
interface Rental {
  id?: string;
  cartId: number;
  renterName: string;
  playerId: string;           // NEW
  holes: number;
  startTime: string;          // ISO string at form submission
  endTime: string;
  chargingEndTime: string;    // NEW
  phone: string;
  email: string;
  notes: string;
  price: number;
  status: string;
  createdAt?: any;
  cancelledAt?: any;          // NEW
  cancellationReason?: string;// NEW
}
```

### Admin App
```typescript
// Same as user app (see admin/src/types.ts)
// Plus optional fields for admin-specific needs
interface Rental {
  // ... same fields as above
  isMember?: boolean;
  membershipNumber?: string;
  // ... other optional fields
}
```

---

## Testing Checklist

### User App
- [ ] Calendar date selection works
- [ ] Previous dates disabled
- [ ] Availability grid shows 54 slots (10:00-20:50)
- [ ] Booked slots are disabled visually
- [ ] Player ID validation shows error on invalid format
- [ ] Duration auto-calculates correctly (9h: 2h40m, 18h: 5h10m)
- [ ] Charging end time shows correctly (+30m for 9h, +50m for 18h)
- [ ] Form submission creates Firestore document
- [ ] Confirmation message appears after booking

### Admin App - Bookings
- [ ] Filter buttons work (All, Today, Upcoming, Past)
- [ ] Status badges display correctly
- [ ] Cancel button appears only on upcoming rentals
- [ ] Cancellation modal opens
- [ ] Cancellation reason is required
- [ ] Booking status updates to cancelled in UI
- [ ] Cancelled bookings disappear from upcoming/today filters

### Admin App - Statistics
- [ ] Overview tab shows key metrics
- [ ] Top 5 players list displays correctly
- [ ] Player tab aggregates by playerId
- [ ] Cart tab shows utilization %
- [ ] Cancellation counts are accurate
- [ ] Last rental date is correct
- [ ] Revenue calculations are correct

---

## Build & Deploy Commands

```bash
# Development
npm run dev              # User app
cd admin && npm run dev  # Admin app

# Build for production
npm run build            # User app
cd admin && npm run build # Admin app
npm run build:all        # Both

# Deploy to Firebase
firebase deploy                  # Everything
firebase deploy --only hosting   # Hosting only
firebase deploy --only functions # Functions only

# Monitor
firebase functions:log
firebase serve                   # Local emulation
```

---

## Common Firestore Queries

### All Rentals This Week
```typescript
const now = new Date();
const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

const q = query(
  collection(db, 'rentals'),
  where('startTime', '>=', Timestamp.fromDate(weekAgo)),
  where('startTime', '<=', Timestamp.fromDate(now)),
  orderBy('startTime', 'desc')
);

const snapshot = await getDocs(q);
```

### Rentals for Specific Cart on Specific Date
```typescript
const date = '2025-12-04';
const dayStart = Timestamp.fromDate(new Date(`${date}T00:00:00`));
const dayEnd = Timestamp.fromDate(new Date(`${date}T23:59:59`));

const q = query(
  collection(db, 'rentals'),
  where('cartId', '==', 1),
  where('startTime', '>=', dayStart),
  where('startTime', '<=', dayEnd)
);

const snapshot = await getDocs(q);
```

### All Confirmed Rentals (Exclude Cancelled)
```typescript
const q = query(
  collection(db, 'rentals'),
  where('status', '!=', 'cancelled'),
  orderBy('status'), // Must order by a field before inequality
  orderBy('startTime', 'desc')
);

const snapshot = await getDocs(q);
```

---

## Performance Tips

### Firestore
- ✅ Use composite indexes for complex queries
- ✅ Filter on client-side when possible (reduce reads)
- ✅ Use onSnapshot for real-time updates, not polling
- ✅ Limit query results with `limit(100)`
- ❌ Avoid OR queries (use multiple queries instead)
- ❌ Don't fetch entire collections if only need subset

### React Components
- ✅ Use useMemo for expensive calculations
- ✅ Use useCallback for event handlers
- ✅ Split large components into smaller ones
- ✅ Lazy load admin pages (async import)
- ❌ Don't create objects in render (define outside)
- ❌ Don't create new arrays/objects as props

### CSS/Styling
- ✅ Use CSS variables for theming
- ✅ Use CSS Grid for layouts
- ✅ Use Flexbox for components
- ✅ Minimize animations (GPU acceleration)
- ❌ Avoid deeply nested CSS selectors
- ❌ Don't use !important

---

## Debugging Tips

### Browser Console
```javascript
// Check Firebase connection
firebase.initializeApp(config);
db.collection('rentals').limit(1).get().then(console.log);

// Check Redux state (if added in future)
console.log(store.getState());
```

### Firebase Console
- Firestore → Develop → Rules (check syntax)
- Firestore → Develop → Indexes (see query indexes)
- Functions → Logs (real-time function logs)
- Hosting → Deployments (see version history)

### Local Testing
```bash
# Start emulator
firebase emulators:start

# In browser, go to http://localhost:4000
# Can directly inspect Firestore data
# Can see function execution logs
```

---

## Git Workflow

```bash
# Check status
git status

# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: Add my feature"

# Push to remote
git push origin feature/my-feature

# Create pull request (on GitHub)
# After review, merge to master
# Delete feature branch

# Pull latest
git pull origin master

# Deploy when ready
npm run build:all
firebase deploy --only hosting
```

---

## Useful Links

| Link | Purpose |
|------|---------|
| https://console.firebase.google.com/project/golfbilkontroll-skigk | Firebase Console |
| https://GolfChart-MultiClub.web.app | Live User App |
| https://GolfChart-MultiClub.web.app/admin | Live Admin Panel |
| https://firebase.google.com/docs | Firebase Docs |
| https://react.dev | React Docs |
| https://www.typescriptlang.org/docs | TypeScript Docs |
| https://vitejs.dev | Vite Docs |

---

**Last Updated:** December 4, 2025
**For:** GolfChart Development Team
