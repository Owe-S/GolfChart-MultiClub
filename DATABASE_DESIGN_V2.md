# Database Design Update - Golf Player Tracking & Booking System

## 📋 Requirements Summary

✅ **Player ID Format**: Ski GK. 073 ###-###### (klubbnummer + unique player ID)
✅ **Track Repeat Customers**: YES - need user history
✅ **Cancel/Modify Bookings**: YES - implement change tracking
✅ **User History/Reports**: YES - track all rental activity
✅ **Authentication**: NOT NOW - Phase 2 (when GolfBox API available)
✅ **Contact Fields**: Email + Mobile (both required)
✅ **Time Intervals**: 10 minutes (4-ball groups)

---

## 🗄️ Updated Firestore Schema

### Collection: `players`
```json
{
  "playerId": "073-1234567",           // Unique: Ski GK. 073-1234567
  "membershipNumber": "073-1234567",   // Alternate lookup
  "name": "John Doe",
  "email": "john@example.no",
  "phone": "+4798765432",              // Mobile number
  "isMember": true,                    // Club member flag
  "memberSince": "2020-01-15",
  "numPlayers": 4,                     // Usually 4-ball
  "preferences": {
    "notificationMethod": "sms",       // "sms" | "email" | "both"
    "smsNotify": true,
    "emailNotify": false
  },
  "stats": {
    "totalRentals": 15,                // Auto-calculated
    "completedRentals": 14,
    "cancelledRentals": 1,
    "totalHours": 56,
    "lastRental": "2025-12-04T14:00:00Z"
  },
  "createdAt": "2020-01-15T10:00:00Z",
  "updatedAt": "2025-12-04T10:00:00Z",
  "status": "active"                   // "active" | "inactive" | "blocked"
}
```

### Collection: `rentals`
```json
{
  "rentalId": "rental_20251204_001",   // Auto-generated or UUID
  "playerId": "073-1234567",           // FOREIGN KEY to players
  "cartId": 1,                         // FOREIGN KEY to carts
  "startTime": "2025-12-04T10:00:00Z",
  "endTime": "2025-12-04T14:00:00Z",   // Auto-calculated: startTime + (holes==18 ? 4h : 2h)
  "holes": 18,                         // 9 or 18
  "numPlayers": 4,                     // Snapshot from player at booking time
  "price": 450,                        // Snapshot: 450kr (18) or 250kr (9)
  "notes": "Special request",
  "status": "pending",                 // "pending" | "active" | "completed" | "cancelled"
  
  // Tracking fields
  "createdAt": "2025-12-04T09:30:00Z",
  "createdBy": "073-1234567",          // Same as playerId (player self-books)
  "updatedAt": "2025-12-04T09:30:00Z",
  "updatedBy": "admin@ski.no",         // Who last modified
  
  // Cancellation tracking
  "cancelledAt": null,                 // When cancelled (if applicable)
  "cancelledBy": null,                 // Who cancelled (player or admin)
  "cancellationReason": null,          // Why cancelled
  "refundStatus": null,                // "pending" | "refunded" | "none"
  
  // Modification tracking (for audit)
  "history": [
    {
      "action": "created",
      "timestamp": "2025-12-04T09:30:00Z",
      "by": "073-1234567",
      "changes": { }
    },
    {
      "action": "modified",
      "timestamp": "2025-12-04T09:45:00Z",
      "by": "073-1234567",
      "changes": { "notes": "Added special request" }
    }
  ]
}
```

### Collection: `carts`
```json
{
  "id": 1,
  "name": "Blå 4",
  "status": "available",               // "available" | "maintenance" | "reserved"
  "type": "4-seater",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## 📅 Calendar & Time Slot System

### How 10-Minute Intervals Work

**Each day has 54 slots** (9:00-19:00):
- 10:00, 10:10, 10:20, 10:30, 10:40, 10:50
- 11:00, 11:10, 11:20, 11:30, 11:40, 11:50
- ... (continues every 10 minutes)
- 19:00, 19:10, 19:20, 19:30, 19:40, 19:50

### Booking Duration Blocks

**For 18 holes (4 hours)**:
- If book 10:00 → reserves 10:00-14:00
- Blocks these slots: 10:00, 10:10, 10:20, 10:30, 10:40, 10:50, 11:00, ... 14:00
- = 25 consecutive slots RED

**For 9 holes (2 hours)**:
- If book 10:00 → reserves 10:00-12:00
- Blocks: 10:00, 10:10, 10:20, ... 12:00
- = 13 consecutive slots RED

### Availability Grid Display

```
DATE: Dec 4, 2025

CART: BLÅ 4
├─ 10:00 🟢 (available)
├─ 10:10 🟢 (available)
├─ 10:20 🟢 (available)
├─ 10:30 🟢 (available)
├─ 10:40 🟢 (available)
├─ 10:50 🟢 (available)
├─ 11:00 🟢 (available)
├─ 11:10 🟢 (available)
├─ 11:20 🟢 (available)
├─ 11:30 🟢 (available)
├─ 11:40 🟢 (available)
├─ 11:50 🟢 (available)
├─ 12:00 🟢 (available)
├─ 12:10 🔴 (BOOKED John Doe 12:10-16:10, 18 holes)
├─ 12:20 🔴 (same booking)
├─ 12:30 🔴 (same booking)
... (all red for 4 hours = 25 slots)
├─ 16:00 🔴 (same booking)
├─ 16:10 🟢 (now available again - booking ended)
├─ 16:20 🟢 (available)
└─ ... continues
```

---

## 📝 Updated Booking Form Fields

### Player Information (Step 1)

**Required:**
- [ ] Player ID / Membership Number (format: 073-1234567)
  - Display format: "Ski GK. 073-1234567"
  - Validate: 3 digits + "-" + 1-7 digits = unique player
  
- [ ] Full Name
  - Auto-fill if returning customer (lookup by Player ID)
  
- [ ] Mobile Phone (+47 format)
  - Required for SMS notifications
  - Validate: Norwegian phone format

- [ ] Email
  - Required for email notifications
  - Validate: Valid email format

**Optional:**
- [ ] Member Since (auto-filled for members)
- [ ] Notification Preference (SMS/Email/Both)

### Booking Information (Step 2)

**Pre-filled:**
- [ ] Date (selected from calendar)
- [ ] Cart Name (selected from grid)
- [ ] Start Time (selected slot)

**Required:**
- [ ] Number of Holes (9 or 18)
  - End time auto-calculates

**Optional:**
- [ ] Number of Players (1-4, default 4)
- [ ] Special Notes/Requests

---

## 🔍 Query Logic for Availability

### Check if Slot Available (Pseudo-code)

```javascript
async function isSlotAvailable(cartId, startTime, holes, date) {
  const duration = holes === 18 ? 4 * 60 : 2 * 60;  // minutes
  const endTime = startTime + duration;
  
  // Query rentals for this cart on this date
  const rentals = await db.collection('rentals')
    .where('cartId', '==', cartId)
    .where('status', 'in', ['pending', 'active'])  // Exclude cancelled
    .where('startTime', '>=', dateStart)           // This date
    .where('startTime', '<', dateEnd)              // This date only
    .get();
  
  // Check for overlaps
  for (let rental of rentals.docs) {
    const rentalStart = rental.startTime;
    const rentalEnd = rental.endTime;
    
    // Overlap check
    if (startTime < rentalEnd && endTime > rentalStart) {
      return false;  // Conflict!
    }
  }
  
  return true;  // Available!
}
```

---

## 👥 Repeat Customer Handling

### First Booking Flow
1. User enters Player ID: "073-1234567"
2. System checks `players` collection
3. NOT FOUND → New player
4. Form shows all fields empty (except ID)
5. User fills: Name, Email, Phone
6. On submit → Create player document + rental document

### Return Customer Flow
1. User enters Player ID: "073-1234567"
2. System checks `players` collection
3. FOUND → Load player data
4. Form auto-fills: Name, Email, Phone
5. Checkboxes for: Use same contact info? Same notification preference?
6. Can override any field
7. On submit → Update player + Create rental document

### Player Stats Auto-Calculated
```javascript
// When rental completes or cancels:
updatePlayerStats(playerId) {
  const rentals = await db.collection('rentals')
    .where('playerId', '==', playerId)
    .get();
  
  const stats = {
    totalRentals: rentals.size,
    completedRentals: rentals.filter(r => r.status === 'completed').length,
    cancelledRentals: rentals.filter(r => r.status === 'cancelled').length,
    totalHours: sum(rentals.map(r => (r.endTime - r.startTime) / 3600)),
    lastRental: max(rentals.map(r => r.startTime))
  };
  
  await db.collection('players').doc(playerId).update({ stats });
}
```

---

## 🔄 Cancellation & Modification System

### Modification Rules

**Player can modify if:**
- ✅ Rental status = "pending" (not yet confirmed)
- ✅ Within 24 hours before start
- ❌ Rental status = "active" (already in use)
- ❌ Rental status = "completed" (finished)

**Admin can always modify:**
- ✅ Any rental (pending/active/completed)
- ✅ Add notes, change times, etc.

### Cancellation Flow

**Player cancellation:**
```
pending → Click "Cancel" → 
  Reason dropdown: [No reason / Too busy / Found other cart / etc]
  → Status = "cancelled"
  → refundStatus = "pending"
  → Slot now RED (historical record)
```

**Admin view in /admin/bookings:**
- Can see cancellation reason
- Can manually adjust refund status
- Can view full history timeline

### History Tracking (Audit Trail)

Every modification saved:
```json
{
  "rentalId": "rental_123",
  "history": [
    {
      "action": "created",
      "timestamp": "2025-12-04T09:30:00Z",
      "by": "073-1234567",
      "changes": { }
    },
    {
      "action": "modified_notes",
      "timestamp": "2025-12-04T09:45:00Z",
      "by": "073-1234567",
      "changes": { "notes": "Added special request" }
    },
    {
      "action": "cancelled",
      "timestamp": "2025-12-04T10:00:00Z",
      "by": "073-1234567",
      "changes": { 
        "status": "pending → cancelled",
        "cancellationReason": "Too busy"
      }
    }
  ]
}
```

---

## 📊 Reports & User History

### Available Reports

**Admin Dashboard can show:**
1. **Today's Schedule**
   - All carts, all time slots
   - Color-coded: pending (yellow), active (blue), completed (green)

2. **Player Booking History**
   - Search by Player ID
   - Show all past rentals
   - Stats: Total hours, Total cost, Visit frequency

3. **Cart Utilization**
   - Which carts most used?
   - Peak booking times?
   - Revenue per cart

4. **Cancellation Report**
   - How many cancellations?
   - Reasons breakdown
   - Refund pending?

---

## 🔐 Security & Phase 2 (GolfBox API)

### Current Phase (Phase 1)
- ❌ NO authentication required
- ✅ Player ID self-reported
- ⚠️ Could have duplicate players
- 🔓 OPEN: Anyone can book for anyone

### Phase 2 (When GolfBox API Available)
- ✅ Verify Player ID against GolfBox database
- ✅ Auto-fetch player name + email from GolfBox
- ✅ Validate membership status
- ✅ Prevent duplicate player records
- ✅ Link to official club member data

### Migration Plan
```
Phase 1 → Phase 2:
1. Keep all existing `players` collection data
2. Add GolfBox API verification
3. On login: Verify playerId against GolfBox
4. Merge duplicate records (if any)
5. Auto-populate missing data from GolfBox
```

---

## ✅ Implementation Checklist

### Database Schema Updates
- [ ] Create `players` collection schema
- [ ] Update `rentals` schema with new fields
- [ ] Add Firestore indexes for queries:
  - `rentals: playerId, status, startTime`
  - `rentals: cartId, status, startTime`
  - `players: playerId (unique)`

### Booking Form Changes
- [ ] Add Player ID input with validation
- [ ] Add Mobile phone field
- [ ] Auto-fill returning customers
- [ ] Add cancellation reason dropdown
- [ ] Add history timeline view

### Calendar/Grid Changes
- [ ] Change to 10-minute intervals (54 slots/day)
- [ ] Update overlap detection logic
- [ ] Show booking duration as blocks (not individual cells)
- [ ] Display booked-by player name on hover

### Admin Dashboard Changes
- [ ] Show cancellation reasons
- [ ] Add player history view
- [ ] Add reports page
- [ ] Add audit trail timeline

### Firestore Rules (Security)
- [ ] Allow read: anyone
- [ ] Allow write rentals: validated playerID + today or future date only
- [ ] Allow write players: only if playerId matches (Phase 2: authenticated)

---

## 🎯 Summary of Changes

| Item | Current | New | Priority |
|------|---------|-----|----------|
| Player tracking | None | Full `players` collection | 🔴 HIGH |
| Player ID format | Text | 073-1234567 validation | 🔴 HIGH |
| Contact fields | Email only | Email + Mobile | 🔴 HIGH |
| Time intervals | Hourly (11 slots) | 10-min intervals (54 slots) | 🔴 HIGH |
| Repeat customers | Not tracked | Auto-lookup + stats | 🔴 HIGH |
| Cancellations | Not supported | Full system + history | 🔴 HIGH |
| Modifications | Not supported | Edit before confirmation | 🟡 MEDIUM |
| History tracking | None | Full audit trail | 🟡 MEDIUM |
| Reports | None | Multiple report types | 🟡 MEDIUM |
| GolfBox API prep | Not ready | Placeholder for Phase 2 | 🟢 LOW (future) |

---

**STATUS: Ready for your approval - Say "OK" to implement!**
