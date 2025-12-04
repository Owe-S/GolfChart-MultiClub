# ⛳ GolfChart - Golf Cart Booking & Management System

A modern, responsive web application for managing golf cart bookings with real-time availability, player statistics, and administrative controls.

**Live URLs:**
- 🎯 **User App (Booking)**: https://GolfChart-MultiClub.web.app
- 📊 **Admin Panel**: https://GolfChart-MultiClub.web.app/admin/

---

## 📋 Features

### User App (Player-Facing)
- ✅ **Calendar-based booking** - Select date with month navigation
- ✅ **10-minute interval slots** - 54 available time slots per day (10:00-20:50, 6 slots/hour)
- ✅ **Real-time availability grid** - Shows booked vs available carts per time slot
- ✅ **Player ID validation** - Format: `073-1234567` (3 digits - 7 digits)
- ✅ **Auto-calculated duration**:
  - 9 holes: 2h 10min play + 30min charging = 2h 40min total
  - 18 holes: 4h 20min play + 50min charging = 5h 10min total
- ✅ **Booking confirmation** - Name, phone, email, notes
- ✅ **Smart slot blocking** - Carts unavailable during play + charging period

### Admin Panel
- ✅ **Bookings management** - View all bookings with status (upcoming, active, completed, cancelled)
- ✅ **Cancellation support** - Cancel upcoming rentals with reason tracking
- ✅ **Player statistics** - Track rentals by player ID, holes played, revenue
- ✅ **Cart utilization** - Monitor usage percentage and revenue per cart
- ✅ **Rental statistics dashboard**:
  - Overview with key metrics (total rentals, cancellations, revenue)
  - Player tracking (ID, name, rental count, last activity)
  - Cart performance (utilization, revenue)
  - Cancellation rates

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19.2.0, Vite 7.2.6, TypeScript 5.9.3
- **Backend**: Firebase Firestore (NoSQL), Cloud Functions (Node 20, Gen 2)
- **Hosting**: Firebase Hosting (europe-west3)
- **Styling**: CSS3 with responsive design (mobile-first)

### Project Structure
```
GolfChartAppV0.9/
├── src/                          # User app (React)
│   ├── components/
│   │   ├── Calendar.tsx          # Date selection with month nav
│   │   ├── AvailabilityGrid.tsx  # 54 time slots grid
│   │   └── BookingForm.tsx       # Booking form with auto-calc
│   ├── UserApp.tsx               # Main user app
│   ├── types.ts                  # TypeScript interfaces
│   └── user-theme.css            # User app styling
├── admin/src/                    # Admin panel (React)
│   ├── pages/
│   │   ├── BookingsListPage.tsx  # Bookings with cancellation
│   │   ├── RentalStatisticsPage.tsx  # Player & cart stats
│   │   └── ...other pages
│   └── App.tsx                   # Admin routing
├── public/                       # Static assets for both apps
│   └── admin/                    # Admin app dist
├── firebase.json                 # Firebase config
├── firestore.rules               # Security rules
└── functions/                    # Cloud functions
    └── src/
        ├── checkAvailability.ts
        └── createRental.ts
```

### Firestore Schema

**Collections:**

1. **carts** - Cart definitions
   ```typescript
   {
     id: number,
     name: string,           // "Blå 4", "Blå 5", etc
     status: string
   }
   ```

2. **rentals** - Booking records
   ```typescript
   {
     cartId: number,
     renterName: string,
     playerId: string,       // "073-1234567" format
     holes: 9 | 18,
     startTime: Timestamp,
     endTime: Timestamp,
     chargingEndTime: Timestamp,  // Play time + charging
     phone: string,
     email: string,
     notes: string,
     price: number,
     status: 'confirmed' | 'cancelled',
     createdAt: Timestamp,
     cancelledAt?: Timestamp,
     cancellationReason?: string
   }
   ```

---

## 🚀 Getting Started

### Development Setup

**Prerequisites:**
- Node.js 18+ (v22.17.0 recommended)
- npm 10.9+
- Firebase CLI 14.26+

**Installation:**
```bash
# Clone repository
git clone <repo-url>
cd GolfChartAppV0.9

# Install dependencies
npm install
cd admin && npm install && cd ..

# Set up environment
firebase login
firebase use golfbilkontroll-skigk
```

### Running Locally

**User App (port 5173):**
```bash
npm run dev
# Open http://localhost:5173
```

**Admin App (port 5173, after user app):**
```bash
cd admin
npm run dev
```

**With Emulators:**
```bash
firebase emulators:start
# Firestore: http://localhost:8080
# Functions: http://localhost:5001
# UI: http://localhost:4000
```

### Building for Production

```bash
# Build both apps
npm run build:all

# Or individually
npm run build              # User app
cd admin && npm run build  # Admin app
```

---

## 📦 Deployment

### Deploy to Firebase Hosting

```bash
# Deploy everything
firebase deploy

# Or hosting only
firebase deploy --only hosting

# Monitor functions
firebase functions:log
```

**Current Hosting:**
- Region: europe-west3
- Functions: 2nd Gen Node 20
- URL: https://GolfChart-MultiClub.web.app

---

## 📚 Database Queries

### Check Availability for a Cart at Specific Time
```typescript
// AvailabilityGrid.tsx uses this pattern
const rentalsQuery = query(rentalsRef, where('cartId', '==', cartId));
const snapshot = await getDocs(rentalsQuery);

// Check if slot time falls within any rental's chargingEndTime
const hasConflict = snapshot.docs.some(doc => {
  const rental = doc.data();
  if (rental.status === 'cancelled') return false;
  
  const rentalStart = new Date(rental.startTime);
  const rentalEnd = new Date(rental.chargingEndTime);
  
  return slotTime >= rentalStart && slotTime < rentalEnd;
});
```

### Get Player Statistics
```typescript
// RentalStatisticsPage.tsx pattern
const rentalsQuery = query(collection(db, 'rentals'));
const snapshot = await getDocs(rentalsQuery);

const playerMap = new Map();
snapshot.docs.forEach(doc => {
  const rental = doc.data();
  if (rental.status === 'cancelled') return;
  
  const playerId = rental.playerId;
  // Aggregate by playerId
});
```

---

## 🎯 Recent Updates (Dec 4, 2025)

### Phase 1: Core Booking System ✅
- User app deployed with calendar + availability grid
- 10-minute time slot intervals (54 slots/day)
- Player ID field with format validation
- Auto-calculated duration with charging periods
- Real-time availability detection

### Phase 2: Cancellations & Analytics ✅
- Admin cancellation feature with reason tracking
- Cancelled rentals free up availability immediately
- Rental statistics dashboard with player tracking
- Cart utilization metrics
- Revenue tracking per player and per cart

---

## 📊 Monitoring & Logs

### Firebase Logs
```bash
firebase functions:log
```

### View Live Performance
- Firestore usage: https://console.firebase.google.com/project/golfbilkontroll-skigk/firestore
- Functions logs: https://console.firebase.google.com/project/golfbilkontroll-skigk/functions

---

## 🔐 Security

### Firestore Rules
```
- Rentals: Public read, admin write
- Carts: Public read
- Players data: Aggregated statistics only
```

See `firestore.rules` for complete security configuration.

---

## 📝 Development Conventions

### Commit Messages
```
feat: Add new feature
fix: Fix a bug
docs: Documentation updates
style: Code style changes
refactor: Code refactoring
test: Testing updates
deploy: Deployment updates
```

### File Organization
- Components: `src/components/ComponentName.tsx`
- Pages: `admin/src/pages/PageName.tsx`
- Types: Centralized in `types.ts` per app
- Styles: Alongside components or in theme CSS

### TypeScript Patterns
- Use interfaces for data types
- Export types from `types.ts`
- Add JSDoc comments for complex functions

---

## 🐛 Troubleshooting

### "Cart not available" but should be available
- Check `chargingEndTime` field is being set correctly
- Verify cancellations have `status: 'cancelled'`
- Confirm time zone matches server

### Functions not deploying
- Check Node version: `node --version` (need 18+)
- Clear cache: `npm cache clean --force`
- Verify Firebase project: `firebase use`

### Booking form validation failing
- Player ID must be `XXX-XXXXXXX` format (e.g., 073-1234567)
- All required fields (name, phone, player ID) must be filled

---

## 📞 Support & Next Steps

### Known Limitations
- Emulator setup requires manual `firebase init`
- Email notifications not yet implemented
- Payment integration pending

### Future Enhancements
- Booking reminders (email/SMS)
- Payment processing (Vipps, credit card)
- Player profile management
- Booking modifications (reschedule)
- Advanced reporting (export to PDF/CSV)
- Mobile app (native iOS/Android)

---

## 📄 License

Internal use - Ski GolfKlubb

**Last Updated:** December 4, 2025
