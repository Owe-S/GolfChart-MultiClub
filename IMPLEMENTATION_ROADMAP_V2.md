# Implementation Roadmap - Database V2

## Phase 1: Core Implementation (THIS SESSION)

### 1.1 Update Firestore Schema

**Create `players` Collection**
```
Document ID: playerId (e.g., "073-1234567")

Fields:
- playerId: string (REQUIRED, UNIQUE) 
  Format: "###-#######" or "###-######" (3 digits, dash, 1-7 digits)
  Example: "073-1234567"
  
- name: string (REQUIRED)
  Example: "John Doe"
  
- email: string (REQUIRED, UNIQUE)
  Format: valid email
  Example: "john@example.no"
  
- phone: string (REQUIRED, UNIQUE)
  Format: +47XXXXXXXX or similar
  Example: "+4798765432"
  
- isMember: boolean (DEFAULT: false)
  
- memberSince: timestamp (OPTIONAL)
  
- numPlayers: number (DEFAULT: 4)
  
- preferences: object
  - notificationMethod: string ("sms" | "email" | "both", DEFAULT: "both")
  
- stats: object (AUTO-CALCULATED)
  - totalRentals: number (DEFAULT: 0)
  - completedRentals: number (DEFAULT: 0)
  - cancelledRentals: number (DEFAULT: 0)
  - totalHours: number (DEFAULT: 0)
  - lastRental: timestamp (nullable)
  
- status: string ("active" | "inactive" | "blocked", DEFAULT: "active")

- createdAt: timestamp (AUTO)
- updatedAt: timestamp (AUTO)
```

**Update `rentals` Collection**
```
Document ID: rentalId (auto-generated, e.g., "rental_20251204_001")

NEW/UPDATED Fields:
- playerId: string (REQUIRED, FOREIGN KEY to players)
  
- numPlayers: number (snapshot from player at booking, DEFAULT: 4)
  
- status: string 
  Values: "pending" | "active" | "completed" | "cancelled"
  
- createdBy: string (DEFAULT: playerId for player bookings)
  
- updatedBy: string (nullable, for admin modifications)
  
- cancelledAt: timestamp (nullable)
  
- cancelledBy: string (nullable, who cancelled)
  
- cancellationReason: string (nullable)
  Values: "too_busy" | "found_other" | "weather" | "personal" | "other"
  
- refundStatus: string (nullable)
  Values: "pending" | "refunded" | "none"
  
- history: array of objects (audit trail)
  Each entry:
  {
    action: string ("created" | "modified" | "cancelled" | "completed"),
    timestamp: timestamp,
    by: string (who made change),
    changes: object (what changed)
  }

KEEP EXISTING Fields:
- rentalId, cartId, startTime, endTime, holes, price, notes, createdAt
```

### 1.2 Update User App Components

**New Component: `PlayerIdInput.tsx`**
```typescript
Props:
- playerId: string
- onPlayerFound: (playerData) => void
- onPlayerNotFound: () => void
- error?: string

Features:
- Input field with format validation (###-#######)
- On blur/change: Query players collection
- If found: Auto-populate name, email, phone
- Show: "Welcome back, [name]! [X] bookings"
- If not found: Clear form for new player
```

**Update Component: `BookingForm.tsx`**
```typescript
NEW Props/Fields:
- playerData: Player object (from lookup)
- onPlayerIdChange: (id) => void

NEW Form Sections:
1. PLAYER IDENTIFICATION (NEW!)
   - Player ID field (with validation)
   - Show: Name + previous bookings count
   
2. CONTACT INFORMATION
   - Name (auto-filled if returning customer)
   - Email (auto-filled)
   - Phone (auto-filled, with +47 format)
   - Notification preference: SMS/Email/Both
   
3. BOOKING DETAILS (unchanged)
   - Holes (9/18)
   - Notes
   
4. REVIEW (NEW!)
   - Show full booking details
   - Show player history
   - Options: Confirm, Go Back, Cancel
```

**Update Component: `AvailabilityGrid.tsx`**
```typescript
MAJOR CHANGES:
- Change from hourly (11 slots) to 10-minute intervals (54 slots)
- Update TIME_SLOTS array:
  OLD: [10:00, 11:00, 12:00, ... 20:00]
  NEW: [10:00, 10:10, 10:20, ... 10:50, 11:00, 11:10, ...]
  
- Update duration calculation:
  - 18 holes = 4 hours = blocks 24 slots
  - 9 holes = 2 hours = blocks 12 slots
  
- Update availability query:
  OLD: Simple check per slot
  NEW: Range-based overlap detection
  
  Query logic:
  for each 10-min slot {
    check: does any existing rental overlap with this slot?
    if overlap: RED (booked)
    else: GREEN (available)
  }
  
- Display improvements:
  - Show booking as continuous block (not individual cells)
  - On hover: Show "Player Name, 18 holes, 10:00-14:00"
  - If cancelled: Show "CANCELLED - reason"
```

**Update Component: `Calendar.tsx`**
```typescript
NO CHANGES NEEDED - Works as-is
```

**Create Component: `BookingHistory.tsx`** (NEW)
```typescript
Props:
- rentalId: string
- history: array

Display:
- Timeline of all changes
- For each change:
  - Action icon (created, modified, cancelled)
  - Timestamp
  - Who made change
  - What changed
  - Any reason (if cancelled)
```

**Update Component: `UserApp.tsx`**
```typescript
NEW State:
- playerData: Player | null
- selectedPlayerId: string

NEW Step (0):
- Player identification before calendar

UPDATED Step 1:
- Player already identified
- Calendar + Grid shown
- Grid now has 54 slots

UPDATED Step 2:
- Form pre-filled if returning customer
- New "Review" step before confirmation

NEW Functions:
- lookupPlayer(playerId): Player | null
- createOrUpdatePlayer(playerId, data)
- saveRentalWithHistory(rentalData, action)
- handleCancellation(rentalId, reason)
```

### 1.3 Update Firestore Queries

**Query 1: Check Cart Availability**
```typescript
async function getAvailableSlots(cartId, date, holes) {
  const duration = holes === 18 ? 4 * 60 : 2 * 60; // minutes
  
  // Get all bookings for this cart on this date (non-cancelled)
  const bookings = await db
    .collection('rentals')
    .where('cartId', '==', cartId)
    .where('status', 'in', ['pending', 'active'])
    .where('startTime', '>=', getDateStart(date))
    .where('startTime', '<', getDateEnd(date))
    .get();
  
  // For each 10-min slot, check overlap
  const slots = generateSlots(); // 54 slots from 10:00 to 19:50
  
  return slots.map(slot => {
    const slotEnd = slot + duration;
    const hasConflict = bookings.docs.some(doc => {
      const rental = doc.data();
      return slot < rental.endTime && slotEnd > rental.startTime;
    });
    return {
      time: slot,
      available: !hasConflict,
      bookedBy: hasConflict ? getBookedBy(rental) : null
    };
  });
}
```

**Query 2: Lookup Player**
```typescript
async function lookupPlayer(playerId) {
  const doc = await db.collection('players').doc(playerId).get();
  return doc.exists ? doc.data() : null;
}
```

**Query 3: Get Player History**
```typescript
async function getPlayerRentals(playerId) {
  const rentals = await db
    .collection('rentals')
    .where('playerId', '==', playerId)
    .orderBy('startTime', 'desc')
    .get();
  return rentals.docs.map(doc => doc.data());
}
```

**Query 4: Create Rental with History**
```typescript
async function createRental(rentalData) {
  const rentalId = `rental_${Date.now()}_${Math.random()}`;
  
  await db.collection('rentals').doc(rentalId).set({
    ...rentalData,
    rentalId,
    status: 'pending',
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: rentalData.playerId,
    history: [{
      action: 'created',
      timestamp: admin.firestore.Timestamp.now(),
      by: rentalData.playerId,
      changes: {}
    }]
  });
  
  // Update player stats
  updatePlayerStats(rentalData.playerId);
}
```

### 1.4 Firestore Indexes to Create

In Firebase Console, add indexes:

**Collection: rentals**
```
Index 1:
- cartId (Ascending)
- status (Ascending)
- startTime (Descending)

Index 2:
- playerId (Ascending)
- status (Ascending)
- startTime (Descending)

Index 3:
- status (Ascending)
- startTime (Descending)
```

**Collection: players**
```
Index 1:
- playerId (Ascending) - for lookups
```

---

## Phase 2: Enhancements (NEXT SESSION)

### 2.1 Player Management UI
- [ ] Player profile page in admin
- [ ] View player history
- [ ] Manual player creation
- [ ] Player stats dashboard

### 2.2 Cancellation UI
- [ ] Cancel booking with reason
- [ ] Modify booking (if < 24h)
- [ ] Show cancellation history
- [ ] Admin refund processing

### 2.3 Reports
- [ ] Player booking report
- [ ] Cart utilization report
- [ ] Cancellation reason breakdown
- [ ] Revenue per player

### 2.4 Notifications
- [ ] SMS integration
- [ ] Email integration
- [ ] Booking confirmation
- [ ] Reminder before pickup

---

## Phase 3: GolfBox Integration (FUTURE)

### 3.1 API Connection
- [ ] Connect to GolfBox API
- [ ] Verify player ID format
- [ ] Fetch member data
- [ ] Validate membership status

### 3.2 Data Migration
- [ ] Verify existing players
- [ ] Merge duplicate records
- [ ] Add GolfBox member info
- [ ] Update player schema

---

## Testing Checklist

### Unit Tests
- [ ] Player ID validation (format check)
- [ ] Time slot generation (54 slots)
- [ ] Overlap detection (range check)
- [ ] Duration calculation (9h vs 18h)

### Integration Tests
- [ ] Create new player + rental
- [ ] Lookup returning customer
- [ ] Check availability
- [ ] Cancel booking with reason

### Manual Testing
- [ ] [ ] New customer booking flow
- [ ] [ ] Returning customer (auto-fill)
- [ ] [ ] View available slots (10-min intervals)
- [ ] [ ] Cancel booking with reason
- [ ] [ ] Admin sees history

---

## Database Validation Rules

```javascript
// Player ID format validation
/^[0-9]{3}-[0-9]{1,7}$/ 
// Examples: "073-1234567", "001-123"

// Email validation
/^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone validation
/^\+47[0-9]{8}$/  // Norwegian numbers
```

---

## Summary

### What Gets Created
✅ New `players` collection (tracks golfers)
✅ Updated `rentals` with history tracking
✅ PlayerIdInput component
✅ Updated BookingForm with auto-fill
✅ 54 10-minute time slots (instead of 11 hourly)
✅ Range-based overlap detection
✅ Cancellation system with reasons
✅ Full audit trail

### What Gets Improved
✅ Repeat customer recognition
✅ Auto-fill returning player info
✅ Player statistics tracking
✅ SMS/Email ready (phone stored)
✅ Booking history visible
✅ Admin can see who cancelled and why

### Ready to Code?
**Confirm "OK" and I'll implement everything above!**
