# 📊 Database Design V2 - Visual Summary

## Current vs. New Architecture

### ❌ CURRENT (V1)
```
User fills form:
├─ Name
├─ Email  
├─ Phone
├─ Holes (9/18)
└─ Bookings just pile up in "rentals"

Problems:
❌ Can't identify repeat customers
❌ No history/stats
❌ Can't cancel/modify
❌ Hourly time slots (wrong for golf)
❌ No player ID validation
```

### ✅ NEW (V2)
```
Two collections working together:

PLAYERS Collection:
├─ playerId: "073-1234567" (UNIQUE - Ski GK format)
├─ name, email, phone
├─ stats: {totalRentals, lastRental, etc}
└─ preferences: {notificationMethod, etc}

RENTALS Collection:
├─ rentalId
├─ playerId → Links to PLAYERS
├─ cartId → Links to CARTS
├─ startTime, endTime (auto-calculated)
├─ status: "pending/active/completed/cancelled"
├─ history: [full audit trail]
└─ cancellationReason (if cancelled)

Benefits:
✅ Repeat customers auto-recognized
✅ Full booking history per player
✅ Can cancel/modify with reason
✅ 10-min intervals (proper golf booking)
✅ Player tracking for reports
✅ Ready for GolfBox API Phase 2
```

---

## Time Slot System: Before vs. After

### ❌ BEFORE (Current - Wrong for Golf)
```
11 hourly slots per cart:
├─ 10:00
├─ 11:00
├─ 12:00
├─ 13:00
├─ 14:00
├─ 15:00
├─ 16:00
├─ 17:00
├─ 18:00
├─ 19:00
└─ 20:00

Problem: Doesn't work for golf!
- 4-ball groups need 10-min spacing
- 18-hole round = 4 hours (blocks multiple slots)
- Current system can't show this
```

### ✅ AFTER (New - Correct for Golf)
```
54 slots per cart (10-minute intervals):
├─ 10:00, 10:10, 10:20, 10:30, 10:40, 10:50 (6 slots/hour)
├─ 11:00, 11:10, 11:20, 11:30, 11:40, 11:50
├─ 12:00, 12:10, 12:20, 12:30, 12:40, 12:50
├─ 13:00, 13:10, 13:20, 13:30, 13:40, 13:50
├─ 14:00, 14:10, 14:20, 14:30, 14:40, 14:50
├─ 15:00, 15:10, 15:20, 15:30, 15:40, 15:50
├─ 16:00, 16:10, 16:20, 16:30, 16:40, 16:50
├─ 17:00, 17:10, 17:20, 17:30, 17:40, 17:50
├─ 18:00, 18:10, 18:20, 18:30, 18:40, 18:50
└─ 19:00, 19:10, 19:20, 19:30, 19:40, 19:50

If book 10:00-14:00 (18 holes):
BLOCKS ALL THESE SLOTS (red): 10:00 → 10:10 → 10:20 → ... → 14:00 (25 slots!)

If book 10:30-12:30 (9 holes):
BLOCKS: 10:30 → 10:40 → 10:50 → 11:00 → ... → 12:30 (13 slots)
```

---

## Booking Form Flow: Before vs. After

### ❌ BEFORE (Current - No player tracking)
```
STEP 1: SELECT DATE & CART
└─ Just pick from availability grid

STEP 2: FILL FORM
├─ Name: _________
├─ Email: _________
├─ Phone: _________
├─ Holes: [9] [18]
└─ Notes: _________

Problem:
- If John books 3 times, he's 3 different entries
- No history for player
- Can't send SMS reminders (no phone tracking)
```

### ✅ AFTER (New - Full player tracking)
```
STEP 0: IDENTIFY PLAYER (NEW!)
├─ Enter Player ID: "073-1234567"
├─ System checks: Is this a returning customer?
│  ├─ YES → Auto-fill name, email, phone
│  ├─ NO → Show empty form
├─ Validate format: Must match "###-#######"
└─ Show: "Welcome back, John! 12 previous rentals"

STEP 1: SELECT DATE & CART
├─ Calendar (unchanged)
├─ Availability grid (now 10-min intervals!)
└─ Shows booked-by name on RED slots

STEP 2: FILL BOOKING DETAILS
├─ Name: John Doe (auto-filled if returning)
├─ Email: john@example.no (auto-filled)
├─ Phone: +4798765432 (auto-filled)
├─ Holes: [9] [18]
├─ Notification: [SMS] [Email] [Both]
├─ Notes: _________
└─ Checkboxes: ☑ Use same contact info?

STEP 3: REVIEW & CONFIRM
├─ Shows: Date, Cart, Time, Duration, Price
├─ Shows: Player history ("3rd booking this month!")
├─ Options: [Confirm] [Cancel] [Go Back]
└─ If changing mind: Can still cancel/modify

Benefits:
✅ SMS can be sent (we have phone)
✅ Personalized experience ("Welcome back!")
✅ Player history visible
✅ Can track repeat customers
```

---

## Cancellation & Modification System

### ❌ BEFORE (Not supported)
```
Player books cart
└─ No way to change mind!
   └─ Call admin or just lose money
```

### ✅ AFTER (Full support)
```
Player books cart (status: PENDING)
├─ Within 24 hours?
│  ├─ YES → Can modify or cancel
│  └─ NO → Can't change
│
If player cancels:
├─ Reason: [Dropdown]
│  ├─ Too busy
│  ├─ Found other cart
│  ├─ Weather
│  ├─ Personal issue
│  └─ Other: ________
├─ Status: PENDING → CANCELLED
├─ History logs: [Cancelled by 073-1234567 at 2025-12-04 10:15]
├─ Slot now shows: RED "073-1234567 cancelled"
└─ Refund: pending (admin can process)

If player modifies:
├─ Can change: Date, Start Time, Holes
├─ Cannot change: Cart (must cancel & rebook)
├─ History logs: [Modified by 073-1234567: startTime 10:00→10:10]
└─ Full audit trail in admin panel
```

---

## Repeat Customer Example

### First Booking
```
Player enters: "073-1234567"
System: [Searching database...]
Result: NOT FOUND (new player)

Form shows:
├─ Name: __________ [empty]
├─ Email: __________ [empty]
└─ Phone: __________ [empty]

Player fills form, books cart
→ Creates new PLAYER document + RENTAL document

Database now has:
players/073-1234567 → {name, email, phone, stats: {totalRentals: 1, ...}}
rentals/rental_001 → {playerId: 073-1234567, ...}
```

### Second Booking (2 weeks later)
```
Player enters: "073-1234567"
System: [Searching database...]
Result: FOUND! Last rental: Nov 18

Form auto-fills:
├─ Name: John Doe ✓ (auto-filled)
├─ Email: john@example.no ✓ (auto-filled)
└─ Phone: +4798765432 ✓ (auto-filled)

Shows: "Welcome back, John! 1 previous rental"

Player just selects date/cart/time
→ Submits (no need to re-enter data)

Database updates:
players/073-1234567 → {stats: {totalRentals: 2, lastRental: 2025-12-18, ...}}
rentals/rental_002 → {playerId: 073-1234567, ...}
```

---

## Player Statistics (Auto-calculated)

### What Gets Tracked
```
For each player (playerId: 073-1234567):

stats: {
  totalRentals: 5,           ← How many times booked?
  completedRentals: 4,       ← Actually used carts
  cancelledRentals: 1,       ← Changed mind
  totalHours: 18,            ← 4×4h + 1×2h = 18 hours
  lastRental: "2025-12-04"   ← Most recent booking
}
```

### Where This Shows Up

**In User App:**
- "Welcome back! 5th booking this year"
- "You've spent 18 hours golfing with us"

**In Admin Dashboard:**
- Player Profile: Shows all stats
- Loyalty Badge: Bronze (5 rentals), Silver (10), Gold (20)
- Revenue per player: "John = 5 rentals × 450kr = 2,250kr total"

---

## Firestore Indexes Needed

```
Collection: rentals
Indexes:
├─ (playerId, status, startTime)
│  └─ For: "Show me this player's pending bookings"
├─ (cartId, status, startTime)
│  └─ For: "Show availability for this cart"
└─ (status, startTime)
   └─ For: "Show all bookings today"

Collection: players
Indexes:
├─ playerId (UNIQUE)
│  └─ For: Lookup by player ID
└─ email
   └─ For: Phase 2 - GolfBox API linking
```

---

## Phase 2 Integration Point (GolfBox API)

### Current (Phase 1)
```
Player: "I'm 073-1234567"
App: "Ok, I'll trust you. Here's a booking form."
└─ ⚠️ No verification!
```

### Future (Phase 2)
```
Player: "I'm 073-1234567"
App: Calls GolfBox API → "Is 073-1234567 a valid member?"
GolfBox: "Yes! Member since 2020, name is John Doe"
App: Auto-fills from GolfBox, validates membership
└─ ✅ Verified & official!
```

### Migration Path
```
1. Keep all current player/rental data
2. Add: "golfboxVerified" flag to players
3. When GolfBox API available:
   - Verify existing players
   - Merge duplicates (if any)
   - Auto-fetch official member info
4. Future bookings require verification
```

---

## Implementation Priority

### 🔴 MUST DO FIRST (This session)
1. [ ] Update rentals schema (add playerId, history, cancellation fields)
2. [ ] Create players collection
3. [ ] Change time slots to 10-minute intervals
4. [ ] Update availability query logic
5. [ ] Update booking form (add Player ID field)
6. [ ] Add cancellation flow

### 🟡 SHOULD DO SOON (Next session)
1. [ ] Auto-lookup returning customers
2. [ ] Show player stats
3. [ ] Add cancellation history to admin
4. [ ] Create player profile view in admin
5. [ ] Add basic reports

### 🟢 NICE TO HAVE (Future)
1. [ ] Loyalty badges
2. [ ] Advanced reporting
3. [ ] SMS integration
4. [ ] GolfBox API integration
5. [ ] Mobile app

---

**Ready to implement? Confirm and I'll start coding!**
