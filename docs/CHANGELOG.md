# Changelog

All notable changes to GolfChart project are documented here.

## [1.0.0] - December 4, 2025

### 🎉 Initial Release - Full Booking & Management System

#### ✨ User App Features
- **Calendar-based booking interface**
  - Month navigation with date selection
  - Visual calendar display
  - Today highlighting

- **10-minute interval availability grid**
  - 54 time slots per day (10:00-20:50)
  - 6 slots per hour
  - Real-time cart availability display
  - Green (available) and booked (disabled) status indicators

- **Smart booking form**
  - Player name field
  - Player ID validation (format: 073-1234567)
  - Phone & email contact fields
  - Auto-calculated end time based on holes (9 or 18)
  - Auto-calculated charging period:
    - 9 holes: 2h 10min play + 30min charging = 2h 40min total
    - 18 holes: 4h 20min play + 50min charging = 5h 10min total

- **Real-time availability detection**
  - Checks cart bookings against time slots
  - Blocks slots during play time + charging period
  - Prevents overbooking

- **Responsive design**
  - Mobile-first approach
  - Touch-friendly buttons (48px minimum)
  - Works on all screen sizes

#### 🛠️ Admin Panel Features
- **Bookings management**
  - View all bookings with date/time
  - Filter by: All, Today, Upcoming, Past
  - Display status: Active (●), Completed (✓), Upcoming (⏰)
  - Show contact info (phone, email)
  - Display rental details (holes, price, cart name)

- **Cancellation system**
  - Cancel upcoming rentals with one click
  - Modal form for cancellation reason
  - Tracks cancellation timestamp and reason
  - Cancelled bookings immediately free up cart availability
  - Display cancelled status in booking list
  - Prevent cancellation of past/active bookings

- **Rental statistics dashboard**
  - Player statistics tab:
    - Player ID, name, rental count
    - Total holes played
    - Total revenue
    - Cancellation count
    - Last rental date
    - Sorted by activity (most active first)
  
  - Cart statistics tab:
    - Cart utilization percentage (visual progress bar)
    - Revenue per cart
    - Total rentals per cart
    - Sorted by usage
  
  - Overview tab:
    - Key metrics cards:
      - Total confirmed rentals
      - Total cancelled bookings
      - Total revenue
      - Average rentals per player
    - Top 5 active players table

- **Reports menu**
  - Revenue report
  - Booking analytics
  - Cart performance
  - Player & rental statistics (NEW)

#### 🔧 Technical Implementation
- **Technology Stack**
  - React 19.2.0
  - Vite 7.2.6 (fast build tool)
  - TypeScript 5.9.3
  - Firebase Firestore (real-time database)
  - Firebase Hosting (europe-west3 region)

- **Database Design**
  - Optimized Firestore schema
  - Rental collection with all booking details
  - Real-time availability queries
  - Efficient player statistics aggregation

- **Architecture**
  - Component-based React structure
  - Firestore real-time listeners (onSnapshot)
  - Type-safe TypeScript interfaces
  - Responsive CSS Grid layout

#### 📊 Data Model
```typescript
Cart {
  id: number
  name: string        // "Blå 4", "Blå 5", "Grønn", "Hvit", "Svart"
  status: string
}

Rental {
  cartId: number
  renterName: string
  playerId: string    // "073-1234567" format
  holes: 9 | 18
  startTime: Timestamp
  endTime: Timestamp
  chargingEndTime: Timestamp  // New: includes charging period
  phone: string
  email: string
  notes: string
  price: number
  status: 'confirmed' | 'cancelled'  // New: support cancellation
  createdAt: Timestamp
  cancelledAt: Timestamp             // New: when cancelled
  cancellationReason: string          // New: why cancelled
}
```

#### 🚀 Deployment
- Live URLs:
  - User App: https://GolfChart-MultiClub.web.app
  - Admin Panel: https://GolfChart-MultiClub.web.app/admin/
- Firebase region: europe-west3
- Cloud Functions: Node.js 20 (2nd Generation)
- Database: Firestore (NoSQL)

#### 📋 Features by Priority

**Implemented (MVP Complete)**
- ✅ 10-minute interval booking system
- ✅ Player ID tracking (format validation)
- ✅ Real-time availability grid
- ✅ Auto-calculated duration with charging
- ✅ Booking cancellation with reason tracking
- ✅ Player statistics & tracking
- ✅ Cart utilization metrics
- ✅ Responsive mobile design
- ✅ Admin bookings management
- ✅ Revenue tracking

**Future Enhancements**
- 🔜 Email confirmations on booking/cancellation
- 🔜 SMS notifications
- 🔜 Player profile management
- 🔜 Booking modifications (reschedule)
- 🔜 Payment integration (Vipps, card)
- 🔜 Advanced reporting (PDF/CSV export)
- 🔜 Mobile app (native iOS/Android)
- 🔜 GolfBox API integration
- 🔜 Automated capacity alerts
- 🔜 Recurring bookings

---

## Git Commit History

### Recent Commits (Latest First)
- `5e5e323` - Add rental statistics dashboard with player tracking
- `60dd298` - Add cancellation feature to admin bookings list
- `da36346` - Implement 10-minute intervals (54 slots/day), player ID validation, and auto-calculated duration with charging periods
- `45fd5ed` - Add deployment completion summary - user app live at / and /admin/
- `c63fa8f` - Build and deploy user and admin apps - user app at root, admin at /admin/ path

---

## Performance Notes

- **User App Build**: 535.81 KB JS (gzip: 167.34 KB), 7.91 KB CSS (gzip: 2.11 KB)
- **Admin App Build**: 1,025.89 KB JS (gzip: 308.19 KB), 46.92 KB CSS (gzip: 8.16 KB)
- **Firestore Queries**: Optimized with proper indexing
- **Real-time Updates**: Using onSnapshot listeners for instant data sync

---

## Known Issues & Limitations

- Email notifications not yet implemented
- Payment system not integrated
- Mobile app not available (web-only)
- Emulator setup requires manual Firebase CLI initialization
- Admin functions require authentication (future: add auth layer)

---

## Version Information

- **App Version**: 1.0.0
- **Release Date**: December 4, 2025
- **Node.js**: v22.17.0
- **npm**: 10.9.2
- **Firebase CLI**: 14.26.0
- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Vite**: 7.2.6

---

## Contributors

- Owe-S (Repository Owner)

---

## License

Internal use - Ski GolfKlubb
