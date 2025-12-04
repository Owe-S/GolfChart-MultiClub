# Feature Documentation

## User App Features

### 1. Calendar-Based Booking

**Purpose:** Allow players to select a booking date with easy month navigation.

**Features:**
- Month/year display with forward/back buttons
- Today highlighting (green)
- Selected date highlighting (blue)
- Previous dates disabled (can't book in past)
- Click date to select for booking

**Usage:**
```tsx
<Calendar 
  selectedDate={selectedDate} 
  onDateChange={setSelectedDate} 
/>
```

**UI/UX:**
- Large touch targets (48px minimum)
- Clear date format (2025-12-04)
- Responsive on mobile

---

### 2. 10-Minute Interval Availability Grid

**Purpose:** Show real-time cart availability at 10-minute intervals with smart slot blocking.

**Features:**
- 54 time slots per day (10:00-20:50)
- 6 slots per hour (10, 20, 30, 40, 50, 00 minutes)
- Real-time Firestore queries for conflict detection
- Visual indicators: ● (available), ✓ (booked)
- Disabled buttons for booked slots

**Auto-blocking Logic:**
- Blocks slots during rental startTime → chargingEndTime
- Includes charging period (not just play time)
- Excludes cancelled rentals from blocking
- 10-minute precision (can't partially block a slot)

**Example Timeline:**
```
10:00 booking for 18 holes
├─ Play period: 10:00 → 14:20 (4h 20min)
├─ Charging period: 14:20 → 15:10 (50min)
└─ Next available: 15:20 (first 10-min slot after 15:10)

Blocked time slots:
- 10:00, 10:10, 10:20, ..., 15:00, 15:10
Unavailable until: 15:20
```

**Performance:**
- ~270 Firestore read operations per refresh (5 carts × 54 slots)
- Optimized with composite indexes
- Real-time updates via onSnapshot

---

### 3. Player ID Validation

**Purpose:** Track players with a unique identifier for statistics and repeat customer recognition.

**Format:** `XXX-XXXXXXX` (3 digits, dash, 7 digits)
- Example: `073-1234567`
- Examples: `001-0000001`, `999-9999999`

**Validation:**
- Real-time format checking on input
- Error message: "Format: 3 siffer-7 siffer (f.eks. 073-1234567)"
- Regex pattern: `/^\d{3}-\d{7}$/`
- Required field for booking submission

**Benefits:**
- Unique player tracking
- Statistical aggregation by player
- Future: Integration with GolfBox player database
- Repeat customer recognition (future feature)

---

### 4. Auto-Calculated Duration & Charging Period

**Purpose:** Automatically calculate rental end time and total cart blocking based on hole count.

**Duration Formula:**

| Holes | Play Time | Charging | Total Block |
|-------|-----------|----------|-------------|
| 9    | 2h 10m    | 30m      | 2h 40m      |
| 18   | 4h 20m    | 50m      | 5h 10m      |

**Auto-Calculation Triggers:**
1. When user selects holes count (9 or 18)
2. When user changes start time

**Calculation Implementation:**
```typescript
function calculateEndTimes(holes: number, startTime: string) {
  const start = new Date(`2000-01-01T${startTime}:00`);
  
  if (holes === 18) {
    // 18 holes: 4h 20min play + 50min charging
    endTime = new Date(start + 4h 20m);
    chargingEndTime = new Date(endTime + 50m);
  } else {
    // 9 holes: 2h 10min play + 30min charging
    endTime = new Date(start + 2h 10m);
    chargingEndTime = new Date(endTime + 30m);
  }
  
  return { endTime, chargingEndTime };
}
```

**Display in Form:**
- End time (play duration): Disabled field, shows "4h 20min spilletid"
- Charging end time: Disabled field, shows "+50 min lading"

---

### 5. Booking Form with Validation

**Purpose:** Collect all required booking information with real-time validation.

**Fields:**
- **Navn** (Name) - Required, text input
- **Spiller-ID** (Player ID) - Required, format XXX-XXXXXXX
- **Antall hull** (Holes) - 9 or 18, dropdown
- **Starttid** (Start time) - 10-minute intervals, select
- **Sluttid** (End time) - Auto-calculated, disabled
- **Klar for neste booking** (Charging end) - Auto-calculated, disabled
- **Telefonnummer** (Phone) - Required, tel input
- **E-postadresse** (Email) - Optional, email input
- **Kommentar** (Notes) - Optional, textarea

**Validation:**
- Name: Not empty
- Player ID: Format XXX-XXXXXXX
- Phone: Not empty
- All auto-calculated fields: Disabled (read-only)

**Submit:**
- Creates Firestore document with status: "confirmed"
- Shows confirmation: "✓ Booking registered! Admin will confirm soon."
- Resets form to step 1 (select cart)

---

## Admin Panel Features

### 1. Bookings List Management

**Purpose:** View and manage all rental bookings with filtering and cancellation.

**View Features:**
- Table with columns: Date/Time, Cart, Customer, Contact, Holes, Price, Status, Actions
- Shows booking details: name, phone, email
- Displays status badges:
  - ● Aktiv (Active - currently playing)
  - ✓ Fullført (Completed - finished)
  - ⏰ Kommende (Upcoming - future)
  - ✗ Avsluttet (Cancelled)

**Filtering:**
- **Alle** (All) - Show everything including cancelled
- **I Dag** (Today) - Show today's bookings
- **Kommende** (Upcoming) - Show future bookings (excludes cancelled)
- **Tidligere** (Past) - Show past bookings

**Status Logic:**
```typescript
const isActive = startTime <= now && endTime >= now;
const isPast = endTime < now;
const isCancelled = rental.status === 'cancelled';

// Display logic
if (isCancelled) → "✗ Avsluttet"
else if (isActive) → "● Aktiv"
else if (isPast) → "✓ Fullført"
else → "⏰ Kommende"
```

**Actions:**
- **Avslut** button appears only on upcoming (non-cancelled) rentals
- Opens cancellation modal with reason form
- Updates Firestore with cancellationReason + cancelledAt

---

### 2. Cancellation Feature

**Purpose:** Allow admin to cancel upcoming bookings with reason tracking.

**Workflow:**
1. Admin clicks "Avslut" on upcoming rental
2. Modal opens with textarea for cancellation reason
3. Admin enters reason (e.g., "Spiller er syk", "Dårlig vær")
4. Admin clicks "Avslut booking" button
5. Firestore updates:
   ```typescript
   status: 'cancelled'
   cancelledAt: Timestamp.now()
   cancellationReason: 'text entered'
   ```
6. Confirmation message: "✓ Booking avsluttet"
7. Booking disappears from upcoming/today lists (still visible in "Alle")

**Constraints:**
- Can only cancel upcoming bookings (not active or past)
- Reason is mandatory for audit trail
- Cancelled bookings immediately free cart availability
- Next refresh of availability grid will show slot as available

**Use Cases:**
- Player calls to cancel
- Weather cancellation
- Equipment maintenance needed
- Club event/closure

---

### 3. Rental Statistics Dashboard

**Location:** Reports → Spillerdata & Statistikk

#### Overview Tab
**Key Metrics:**
- **Total leiinger** - Confirmed rentals count
- **Avsluttet** - Cancelled rentals count + cancellation rate %
- **Total inntekt** - Sum of all rental prices
- **Gjennomsnitt per spiller** - (Total rentals / player count)

**Top 5 Active Players Table:**
| Spiller-ID | Navn | Leiinger | Hull | Inntekt | Avsluttet | Siste leie |
|------------|------|----------|------|---------|-----------|-----------|
| 073-1234567 | John Doe | 5 | 45 | 2000 kr | 1 | 04 des |
| ... | ... | ... | ... | ... | ... | ... |

#### Players Tab (Spillere)

**Complete Player Statistics Table:**
| Spiller-ID | Navn | Leiinger | Hull | Inntekt | Avsluttet | Siste aktivitet |
|------------|------|----------|------|---------|-----------|-----------------|
| 073-1234567 | John Doe | 5 | 45 | 2000 kr | 1 | 04 des 2025 |
| 001-0000123 | Jane Smith | 3 | 27 | 1200 kr | 0 | 02 des 2025 |
| ... | ... | ... | ... | ... | ... | ... |

**Features:**
- Sorted by rental count (most active first)
- Shows average holes per rental: `45 / 5 = 9.0 gjennomsnitt`
- Cancellations shown as red badge only if > 0
- Last activity shows date in format "04 des 2025"
- Empty state: "Ingen spillerdata"

**Use Case:**
- Identify repeat customers
- Track player preferences (9 vs 18 holes)
- Monitor cancellation patterns per player
- Calculate revenue per player

#### Carts Tab (Biler)

**Cart Utilization Table:**
| Bil | Leiinger | Utnyttelse | Inntekt |
|-----|----------|-----------|---------|
| 🚗 Bil #1 | 12 | [████████░░] 85% | 5200 kr |
| 🚗 Bil #2 | 8 | [█████░░░░░] 55% | 3400 kr |
| ... | ... | ... | ... |

**Features:**
- Progress bar visualization of utilization %
- Sorted by rental count (most used first)
- Utilization calculated as: `(rentals / (total_rentals / num_carts)) * 100`
- Revenue aggregated per cart
- Empty state: "Ingen bildata"

**Use Cases:**
- Capacity planning
- Identify underutilized carts
- Schedule maintenance on low-usage carts
- Track revenue per asset

---

## Statistics Aggregation Logic

### Player Statistics Calculation

```typescript
// Group rentals by playerId
const playerMap = new Map();

rentals.forEach(rental => {
  if (rental.status === 'cancelled') {
    // Count cancellations separately
    playerStat.cancellations += 1;
  } else {
    // Aggregate only confirmed rentals
    playerStat.totalRentals += 1;
    playerStat.totalHoles += rental.holes;
    playerStat.totalCost += rental.price;
    playerStat.lastRentalDate = max(lastRentalDate, startTime);
  }
});

// Sort by activity
players.sort((a, b) => b.totalRentals - a.totalRentals);
```

### Cart Utilization Calculation

```typescript
const avgRentalsPerCart = totalRentals / numCarts;
const cartUtilization = (cartRentals / avgRentalsPerCart) * 100;
```

---

## Data Privacy & Security

**What's Tracked:**
- Player ID (not personal identity in most cases)
- Rental date/time (booking patterns)
- Holes played (player preferences)
- Revenue (aggregated only)
- Cancellation reasons (audit trail)

**What's NOT Tracked:**
- Personal names (except in booking contact)
- Email addresses in statistics
- Phone numbers in statistics
- Payment information

**Security Rules:**
- Statistics are aggregated (no individual player data exposed)
- Admin panel requires future authentication layer
- Cancellation reasons visible to admin only
- Firestore rules prevent unauthorized writes

---

## Future Enhancements

### Phase 3: Player Management
- Player profile pages
- Booking history per player
- Player preferences (preferred times, holes)
- Repeat customer loyalty tracking

### Phase 4: Notifications
- Email confirmation on booking
- Email reminder before rental
- SMS cancellation notifications
- Admin alerts for high cancellation rates

### Phase 5: Advanced Analytics
- Heatmaps of booking patterns
- Peak time analysis
- Revenue forecasting
- Player retention metrics

### Phase 6: Integration
- GolfBox API integration for player sync
- Payment processing (Vipps, card)
- Email marketing integration
- Invoice/receipt generation

---

**Last Updated:** December 4, 2025
