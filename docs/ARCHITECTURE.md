# Architecture & Design Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                          │
│                   (europe-west3 region)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐      ┌─────────────────────────┐   │
│  │   User App (/)      │      │   Admin App (/admin/)   │   │
│  │                     │      │                         │   │
│  │ • React 19.2.0      │      │ • React 19.2.0          │   │
│  │ • Vite 7.2.6        │      │ • Vite 7.2.6            │   │
│  │ • TypeScript        │      │ • TypeScript            │   │
│  │                     │      │ • React Router          │   │
│  │ Features:           │      │                         │   │
│  │ - Booking calendar  │      │ Features:               │   │
│  │ - 10-min slots      │      │ - Bookings list         │   │
│  │ - Real-time grid    │      │ - Cancellations         │   │
│  │ - Form validation   │      │ - Statistics            │   │
│  └──────┬──────────────┘      └──────────┬──────────────┘   │
│         │                                 │                   │
│         └─────────────┬───────────────────┘                   │
│                       │ (Firebase SDK)                        │
│         ┌─────────────▼──────────────┐                        │
│         │  Firebase Auth / Init      │                        │
│         │  Project: golfbilkontroll- │                        │
│         │  skigk                     │                        │
│         └─────────────┬──────────────┘                        │
└─────────────────────────┼─────────────────────────────────────┘
                          │
        ┌─────────────────▼──────────────────┐
        │   Firebase Backend Services        │
        │      (europe-west3 region)         │
        ├────────────────────────────────────┤
        │                                    │
        │  ┌──────────────────────────────┐  │
        │  │  Firestore Database          │  │
        │  │                              │  │
        │  │  Collections:                │  │
        │  │  • carts                     │  │
        │  │  • rentals                   │  │
        │  │                              │  │
        │  │  Features:                   │  │
        │  │  - Real-time listeners       │  │
        │  │  - Automatic indexing        │  │
        │  │  - Security rules            │  │
        │  └──────────────────────────────┘  │
        │                                    │
        │  ┌──────────────────────────────┐  │
        │  │  Cloud Functions (Gen 2)     │  │
        │  │  Node.js 20                  │  │
        │  │                              │  │
        │  │  Functions:                  │  │
        │  │  • checkAvailability()       │  │
        │  │  • createRental()            │  │
        │  │                              │  │
        │  │  HTTP endpoints:             │  │
        │  │  • /checkAvailability        │  │
        │  │  • /createRental             │  │
        │  └──────────────────────────────┘  │
        │                                    │
        │  ┌──────────────────────────────┐  │
        │  │  Firestore Security Rules    │  │
        │  │                              │  │
        │  │  • Rentals: Public read      │  │
        │  │  • Carts: Public read        │  │
        │  │  • Admin: Write access       │  │
        │  └──────────────────────────────┘  │
        │                                    │
        └────────────────────────────────────┘
```

## Frontend Architecture

### User App Component Hierarchy

```
UserApp.tsx (Root Component)
├── State Management:
│   ├── selectedDate: string
│   ├── carts: GolfCart[]
│   ├── selectedCart: GolfCart | null
│   └── bookingStep: 'select' | 'form'
│
├── Lifecycle:
│   └── useEffect: Load carts on mount
│
├── Handlers:
│   ├── handleCartSelect(cart)
│   └── handleBooking(bookingData)
│
└── Render:
    ├── Step 1: Select Cart
    │   ├── Calendar
    │   │   └── Props: selectedDate, onDateChange
    │   └── AvailabilityGrid
    │       ├── Props: selectedDate, carts, onCartSelect
    │       ├── State: cellStatuses (Map)
    │       ├── Firestore Query: Get all rentals
    │       └── Logic: Check conflicts with chargingEndTime
    │
    └── Step 2: Fill Form
        └── BookingForm
            ├── Props: cart, selectedDate, onSubmit, onCancel
            ├── State: formData, playerIdError
            ├── Functions:
            │   ├── calculateEndTimes(holes, startTime)
            │   ├── validatePlayerId(id)
            │   └── handleChange(e)
            └── Validation:
                ├── Player ID format: 073-1234567
                ├── Required fields
                └── Auto-calculate duration
```

### Admin App Page Structure

```
AdminLayout (Wrapper)
├── Header: Logo, notifications, user menu
├── Sidebar: Navigation with icons
├── Main Content: Outlet
└── Mobile Bottom Nav

Routes:
├── / → DashboardHome
├── /booking → BookingPage
├── /bookings → BookingsListPage
│   ├── Features:
│   │   ├── Filter by date range (all/today/upcoming/past)
│   │   ├── Cancel upcoming rentals
│   │   ├── Modal for cancellation reason
│   │   └── Display cancellation status
│   └── Firestore: Query rentals with status filter
├── /carts → CartsPage
├── /reports → ReportsPage
│   ├── /revenue → RevenueReportPage
│   ├── /analytics → BookingAnalyticsPage
│   ├── /performance → CartPerformancePage
│   └── /statistics → RentalStatisticsPage ← NEW
└── ...

RentalStatisticsPage:
├── Tabs:
│   ├── Overview
│   │   ├── Metric cards (totals, avg)
│   │   └── Top 5 players table
│   ├── Players
│   │   └── Complete player list with aggregates
│   └── Carts
│       └── Cart utilization with progress bars
└── Firestore: Query all rentals, aggregate by playerId
```

## Data Flow

### Booking Creation Flow

```
1. User selects date + cart
   └─> AvailabilityGrid checks conflicts via Firestore

2. User fills booking form
   ├─> Real-time validation (player ID format)
   ├─> Auto-calculate endTime (base duration)
   └─> Auto-calculate chargingEndTime (+charging period)

3. User submits form
   └─> UserApp.handleBooking()

4. Save to Firestore
   └─> addDoc(rentals, {
       cartId, renterName, playerId, holes,
       startTime, endTime, chargingEndTime,
       phone, email, notes, price,
       status: 'confirmed', createdAt
   })

5. Real-time sync
   ├─> AvailabilityGrid updates via onSnapshot()
   ├─> BookingsListPage updates via onSnapshot()
   └─> User sees confirmation

Time Flow:
10:00 startTime
├─ 10:00-14:20: Play period (4h 20m for 18 holes)
└─ 14:20-15:10: Charging period (50m for 18 holes)
   = 15:10 chargingEndTime
   = Next slot available: 15:20 (10-min grid)
```

### Availability Check Logic

```typescript
// For each cart + time slot
const slotTime = new Date(`${selectedDate}T${slot.time}:00`);

rentals.forEach(rental => {
  if (rental.cartId !== cartId) return;
  if (rental.status === 'cancelled') return;
  
  const rentalStart = new Date(rental.startTime);
  const rentalEnd = new Date(rental.chargingEndTime);  // ← includes charging
  
  // Slot is booked if it falls within rental duration
  if (slotTime >= rentalStart && slotTime < rentalEnd) {
    setStatus(slot, 'booked');
  }
});
```

### Cancellation Flow

```
1. Admin clicks "Avslut" button on upcoming rental
   └─> Open modal for cancellation reason

2. Admin enters reason and confirms
   └─> BookingsListPage.handleCancelRental()

3. Update Firestore rental document
   └─> updateDoc(rentalRef, {
       status: 'cancelled',
       cancelledAt: Timestamp.now(),
       cancellationReason: 'text'
   })

4. Real-time sync
   ├─> BookingsListPage re-renders (status filter)
   ├─> AvailabilityGrid re-queries rentals
   │   └─> Cancelled rentals excluded from conflict check
   └─> StatisticsPage updates cancellation counters
```

## Database Schema

### Firestore Collections

#### Collection: carts
```
Document ID: auto-generated or numeric
{
  id: number,              // 1, 2, 3, 4, 5
  name: string,            // "Blå 4", "Blå 5", "Grønn", "Hvit", "Svart"
  status: string           // "available", "rented", "out_of_order"
}

Indexes:
- None required (small collection, full scan acceptable)
```

#### Collection: rentals
```
Document ID: auto-generated UUID
{
  cartId: number,                    // 1-5 (references cart)
  renterName: string,                // "John Doe"
  playerId: string,                  // "073-1234567" (format: XXX-XXXXXXX)
  holes: number,                     // 9 or 18
  startTime: Timestamp,              // 2025-12-04T10:00:00Z
  endTime: Timestamp,                // 2025-12-04T14:20:00Z (play duration)
  chargingEndTime: Timestamp,        // 2025-12-04T15:10:00Z (play + charging)
  phone: string,                     // "98765432"
  email: string,                     // "user@example.com"
  notes: string,                     // Optional comments
  price: number,                     // 450 or 250
  status: string,                    // "confirmed" or "cancelled"
  createdAt: Timestamp,              // When booked
  cancelledAt: Timestamp,            // When cancelled (optional)
  cancellationReason: string         // Why cancelled (optional)
}

Indexes:
- startTime (ascending)
- cartId + startTime (composite)
- status + startTime (composite)
- playerId + startTime (composite)
```

## Security Architecture

### Firestore Security Rules

```
// Public reads for availability checks
match /carts/{document=**} {
  allow read: if true;  // Everyone can see carts
}

match /rentals/{document=**} {
  allow read: if true;  // Everyone can see bookings
  allow create: if request.auth != null;  // Authenticated users can book
  allow update: if request.auth.token.admin == true;  // Only admin can modify
}
```

### Authentication Flow (Future)

```
Current: Open access
Future: 
├── User sign-up with email/password
├── Admin authentication for panel
└── Role-based access control (RBAC)
```

## Performance Considerations

### Firestore Query Optimization

1. **Availability Check** (AvailabilityGrid)
   - Query: `GET /rentals WHERE cartId == X`
   - Optimization: Composite index on (cartId, startTime)
   - Load: ~5 carts × 54 slots = 270 operations/refresh

2. **Statistics Aggregation** (RentalStatisticsPage)
   - Query: `GET /rentals` (all rentals)
   - Optimization: In-memory aggregation by playerId
   - Load: Single query, then JavaScript map/reduce

3. **Bookings List** (BookingsListPage)
   - Query: `GET /rentals ORDER BY startTime DESC`
   - Optimization: Index on startTime
   - Filtering: Client-side after fetch

### Caching Strategy

- **Client-side**: React component state + Firestore SDK caching
- **Real-time**: onSnapshot listeners for live updates
- **No server cache**: Firestore handles real-time sync

### Bundle Size

- **User App**: 535.81 KB JS (gzip: 167.34 KB)
- **Admin App**: 1,025.89 KB JS (gzip: 308.19 KB)
- **Total**: ~1.5 MB JS (gzipped: ~475 KB)

## Deployment Architecture

```
GitHub Repository (Master Branch)
         ↓
Git Push Trigger
         ↓
Local Build
├── npm run build:all
├─── npm run build (User app)
├─── cd admin && npm run build (Admin app)
└─── Copy admin/dist to public/admin
         ↓
Firebase Deploy
├── firebase deploy --only hosting
├─── Upload public/ to Firebase Hosting
├─── firebase deploy --only functions
└─── Deploy Cloud Functions to europe-west3
         ↓
Firebase Hosting (europe-west3)
├── Public CDN distribution
├── Index.html → User app at /
├── public/admin/ → Admin app at /admin/
└── Automatic HTTPS + caching

Live URLs:
- User: https://GolfChart-MultiClub.web.app
- Admin: https://GolfChart-MultiClub.web.app/admin/
```

## Error Handling

### Frontend Error Cases

1. **Cart Availability Check Fails**
   - Show: "Laster tilgjengelighet..." spinner
   - Fallback: Display empty grid with retry button

2. **Booking Submission Fails**
   - Show: Alert with error message
   - Log: Console error for debugging
   - Action: User can retry

3. **Firestore Connection Lost**
   - Behavior: onSnapshot listener reconnects automatically
   - Timeout: After 60s, show offline indicator

### Admin Error Cases

1. **Cancellation Fails**
   - Show: Alert "✗ Feil ved avslutting av booking"
   - Log: Console error
   - Action: User can retry

2. **Statistics Load Fails**
   - Show: Skeleton loaders
   - Fallback: Empty state "Ingen spillerdata"

## Monitoring & Logging

### Firebase Console Links

- Project: https://console.firebase.google.com/project/golfbilkontroll-skigk
- Firestore: .../firestore/databases
- Functions logs: .../functions/logs
- Hosting: .../hosting/realtime

### Local Development Logging

```bash
# Real-time function logs
firebase functions:log

# Emulator logs
firebase emulators:start --debug
```

## Testing Strategy (Recommended)

### Unit Tests
- Component rendering
- Validation functions (player ID, dates)
- Calculation functions (duration, charging)

### Integration Tests
- Firestore real-time sync
- Booking creation flow
- Cancellation flow

### E2E Tests
- User booking journey
- Admin cancellation
- Statistics accuracy

## Future Scalability

### Horizontal Scaling

1. **Multiple Functions Regions**
   - Current: europe-west3 only
   - Future: Add europe-west1, us-central1 for global latency

2. **Database Sharding**
   - Current: Single rentals collection
   - Future: Shard by date range if > 100K records/month

3. **Cloud Storage**
   - For booking confirmations (PDF generation)
   - For export files (CSV, Excel)

### Performance Improvements

1. **Caching Layer**
   - Redis cache for frequently accessed queries
   - CDN caching for static assets

2. **Database Optimization**
   - Add more composite indexes
   - Archive old records (> 1 year) to separate collection

3. **Frontend Optimization**
   - Code splitting by route
   - Lazy loading of admin pages
   - Service Worker for offline capability

---

**Last Updated:** December 4, 2025
