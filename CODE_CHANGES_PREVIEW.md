# 📝 Code Changes Preview - What Will Be Modified

## Files to Create (NEW)

### 1. `src/components/PlayerIdInput.tsx` (NEW FILE)
```typescript
import { useState } from 'react';
import { db } from '../firebase';
import { collection, doc, getDoc } from 'firebase/firestore';

interface PlayerIdInputProps {
  onPlayerFound: (playerData: any) => void;
  onPlayerNotFound: () => void;
}

export default function PlayerIdInput({ onPlayerFound, onPlayerNotFound }: PlayerIdInputProps) {
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validate format: ###-#######
  const isValidFormat = (id: string) => /^[0-9]{3}-[0-9]{1,7}$/.test(id);

  const handleLookup = async (e?: React.FocusEvent<HTMLInputElement>) => {
    if (!playerId.trim()) return;
    
    if (!isValidFormat(playerId)) {
      setError('Format must be: 073-1234567 (3 digits - 1-7 digits)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const playerDoc = await getDoc(doc(db, 'players', playerId));
      
      if (playerDoc.exists()) {
        const player = playerDoc.data();
        onPlayerFound(player);
      } else {
        onPlayerNotFound();
      }
    } catch (err: any) {
      setError('Error looking up player: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="player-id-input">
      <h3>📱 Spiller-ID</h3>
      <input
        type="text"
        placeholder="073-1234567"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value.toUpperCase())}
        onBlur={handleLookup}
        disabled={loading}
        maxLength={15}
      />
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Søker...</p>}
    </div>
  );
}
```

### 2. `src/components/BookingHistory.tsx` (NEW FILE)
```typescript
interface BookingHistoryProps {
  history?: Array<{
    action: string;
    timestamp: any;
    by: string;
    changes: any;
  }>;
}

export default function BookingHistory({ history }: BookingHistoryProps) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="booking-history">
      <h4>📋 Historikk</h4>
      <div className="timeline">
        {history.map((entry, idx) => (
          <div key={idx} className="entry">
            <div className="action-icon">{getActionIcon(entry.action)}</div>
            <div className="details">
              <strong>{formatAction(entry.action)}</strong>
              <span className="timestamp">{formatTime(entry.timestamp)}</span>
              <span className="by">Av: {entry.by}</span>
              {entry.changes && Object.keys(entry.changes).length > 0 && (
                <span className="changes">{JSON.stringify(entry.changes)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getActionIcon(action: string) {
  const icons: Record<string, string> = {
    created: '✅',
    modified: '✏️',
    cancelled: '❌',
    completed: '🏁'
  };
  return icons[action] || '•';
}

function formatAction(action: string) {
  const labels: Record<string, string> = {
    created: 'Booking opprettet',
    modified: 'Booking endret',
    cancelled: 'Booking kansellert',
    completed: 'Completed'
  };
  return labels[action] || action;
}

function formatTime(timestamp: any) {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString('no-NO');
}
```

### 3. `src/services/firestore.ts` (NEW FILE)
```typescript
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  FieldValue,
  serverTimestamp,
} from 'firebase/firestore';

// ===== PLAYERS =====

export async function lookupPlayer(playerId: string) {
  try {
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    return playerDoc.exists() ? playerDoc.data() : null;
  } catch (error) {
    console.error('Error looking up player:', error);
    return null;
  }
}

export async function createPlayer(playerData: any) {
  try {
    const playerId = playerData.playerId;
    await setDoc(doc(db, 'players', playerId), {
      ...playerData,
      stats: {
        totalRentals: 0,
        completedRentals: 0,
        cancelledRentals: 0,
        totalHours: 0,
        lastRental: null,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
    });
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
}

export async function updatePlayer(playerId: string, updates: any) {
  try {
    await updateDoc(doc(db, 'players', playerId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
}

// ===== RENTALS =====

export async function checkAvailability(
  cartId: number,
  date: string,
  holes: number
) {
  try {
    const duration = holes === 18 ? 4 * 60 : 2 * 60; // minutes
    
    // Get date boundaries
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    // Query rentals for this cart on this date
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('cartId', '==', cartId),
      where('status', 'in', ['pending', 'active']),
      where('startTime', '>=', Timestamp.fromDate(dateStart)),
      where('startTime', '<', Timestamp.fromDate(dateEnd))
    );

    const snapshot = await getDocs(rentalsQuery);
    const bookings = snapshot.docs.map(doc => doc.data());

    // Generate 54 time slots (10-min intervals from 10:00 to 19:50)
    const slots = generateTimeSlots();

    return slots.map(slot => {
      const slotTime = new Date(`${date}T${slot}:00`);
      const slotEnd = new Date(slotTime.getTime() + duration * 60000);

      const conflict = bookings.find(booking => {
        const bookingStart = booking.startTime.toDate();
        const bookingEnd = booking.endTime.toDate();
        return slotTime < bookingEnd && slotEnd > bookingStart;
      });

      return {
        time: slot,
        available: !conflict,
        bookedBy: conflict?.playerName || null,
      };
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

export async function createRental(rentalData: any) {
  try {
    const rentalId = `rental_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const history = [{
      action: 'created',
      timestamp: serverTimestamp(),
      by: rentalData.playerId,
      changes: {},
    }];

    await setDoc(doc(db, 'rentals', rentalId), {
      ...rentalData,
      rentalId,
      status: 'pending',
      createdAt: serverTimestamp(),
      createdBy: rentalData.playerId,
      history,
    });

    // Update player stats
    await updatePlayerStats(rentalData.playerId);

    return rentalId;
  } catch (error) {
    console.error('Error creating rental:', error);
    throw error;
  }
}

export async function cancelRental(
  rentalId: string,
  playerId: string,
  reason: string
) {
  try {
    const rentalDoc = await getDoc(doc(db, 'rentals', rentalId));
    const rental = rentalDoc.data();

    const newHistory = [
      ...(rental?.history || []),
      {
        action: 'cancelled',
        timestamp: serverTimestamp(),
        by: playerId,
        changes: {
          status: `pending → cancelled`,
          cancellationReason: reason,
        },
      },
    ];

    await updateDoc(doc(db, 'rentals', rentalId), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelledBy: playerId,
      cancellationReason: reason,
      refundStatus: 'pending',
      history: newHistory,
    });

    await updatePlayerStats(playerId);
  } catch (error) {
    console.error('Error cancelling rental:', error);
    throw error;
  }
}

// ===== HELPERS =====

function generateTimeSlots(): string[] {
  const slots = [];
  for (let hour = 10; hour < 20; hour++) {
    for (let min = 0; min < 60; min += 10) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
  }
  return slots;
}

async function updatePlayerStats(playerId: string) {
  try {
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('playerId', '==', playerId)
    );
    
    const snapshot = await getDocs(rentalsQuery);
    const rentals = snapshot.docs.map(doc => doc.data());

    const stats = {
      totalRentals: rentals.length,
      completedRentals: rentals.filter(r => r.status === 'completed').length,
      cancelledRentals: rentals.filter(r => r.status === 'cancelled').length,
      totalHours: rentals.reduce((sum, r) => {
        const hours = (r.endTime.toDate() - r.startTime.toDate()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0),
      lastRental: rentals.length > 0 ? rentals[0].startTime : null,
    };

    await updatePlayer(playerId, { stats });
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}
```

---

## Files to Update (MODIFY)

### `src/components/BookingForm.tsx`
**Changes:**
```typescript
// ADD NEW PROPS
interface BookingFormProps {
  cart: GolfCart | null;
  selectedDate: string;
  playerId?: string;           // NEW
  playerData?: any;            // NEW (auto-filled)
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// ADD NEW FORM FIELDS
const [formData, setFormData] = useState({
  renterName: playerData?.name || '',           // NEW - auto-filled
  phone: playerData?.phone || '',               // NEW - auto-filled
  email: playerData?.email || '',               // NEW - auto-filled
  membershipNumber: playerData?.membershipNumber || '',
  isMember: playerData?.isMember || false,
  holes: 18,
  startTime: '10:00',
  endTime: '14:00',
  notes: '',
  cancellationReason: '',                       // NEW
});

// UPDATE SUBMIT HANDLER
const handleSubmit = async (e: any) => {
  e.preventDefault();
  
  // Create or update player
  const playerExists = await lookupPlayer(playerId);
  if (!playerExists) {
    await createPlayer({ playerId, ...formData });
  }

  // Create rental with history
  const rentalId = await createRental({
    playerId,
    cartId: cart.id,
    startTime: new Date(selectedDate + 'T' + formData.startTime),
    endTime: calculateEndTime(),
    holes: formData.holes,
    numPlayers: 4,
    price: formData.holes === 18 ? 450 : 250,
    notes: formData.notes,
    playerName: formData.renterName,
  });

  // Show confirmation
  alert('✓ Booking registered! Admin will confirm soon.');
  // Reset form
};

// ADD CANCELLATION SECTION
<div className="form-section">
  <h3>❌ Cancellation (if needed)</h3>
  <label>Reason (if cancelling):</label>
  <select
    name="cancellationReason"
    value={formData.cancellationReason}
    onChange={handleChange}
  >
    <option value="">-- Select reason --</option>
    <option value="too_busy">Too busy</option>
    <option value="found_other">Found other cart</option>
    <option value="weather">Bad weather</option>
    <option value="personal">Personal reason</option>
    <option value="other">Other</option>
  </select>
</div>
```

### `src/components/AvailabilityGrid.tsx`
**Changes:**
```typescript
// CHANGE TIME SLOTS
const TIME_SLOTS = generateTimeSlots(); // Instead of hardcoded 11 slots

function generateTimeSlots() {
  const slots = [];
  for (let hour = 10; hour < 20; hour++) {
    for (let min = 0; min < 60; min += 10) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
  }
  return slots; // Now 54 slots instead of 11!
}

// UPDATE OVERLAP DETECTION
useEffect(() => {
  const loadAvailability = async () => {
    try {
      setLoading(true);
      
      // Use new checkAvailability function
      const availability = await checkAvailability(
        cart.id,
        selectedDate,
        18 // or 9 based on user selection
      );

      // Convert to map for grid display
      const statusMap = new Map();
      availability.forEach(slot => {
        statusMap.set(`${cart.id}-${slot.time}`, {
          status: slot.available ? 'available' : 'booked',
          bookedBy: slot.bookedBy
        });
      });
      
      setCellStatuses(statusMap);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  loadAvailability();
}, [selectedDate, carts]);
```

### `src/UserApp.tsx`
**Changes:**
```typescript
// ADD NEW STATE
const [playerData, setPlayerData] = useState<any>(null);
const [selectedPlayerId, setSelectedPlayerId] = useState('');
const [bookingStep, setBookingStep] = useState<'player' | 'select' | 'form'>('player'); // NEW STEP

// NEW STEP 0: PLAYER IDENTIFICATION
if (bookingStep === 'player') {
  return (
    <div className="user-app">
      <div className="step active">
        <div className="step-header">
          <div className="step-number">0</div>
          <h2>Identifiser deg</h2>
        </div>
        
        <PlayerIdInput
          onPlayerFound={(player) => {
            setPlayerData(player);
            setBookingStep('select');
          }}
          onPlayerNotFound={() => {
            setPlayerData(null);
            setBookingStep('select');
          }}
        />
      </div>
    </div>
  );
}

// UPDATED STEP 2: PASS PLAYER DATA TO FORM
if (bookingStep === 'form') {
  return (
    <BookingForm
      cart={selectedCart}
      selectedDate={selectedDate}
      playerId={selectedPlayerId}
      playerData={playerData}
      onSubmit={handleBooking}
      onCancel={() => setBookingStep('select')}
    />
  );
}
```

---

## Firestore Collections (To Create)

### New Collection: `players`
```
Document ID: "073-1234567"

Fields:
├─ playerId: "073-1234567"
├─ name: "John Doe"
├─ email: "john@example.no"
├─ phone: "+4798765432"
├─ isMember: true
├─ membershipNumber: "073-1234567"
├─ stats: {totalRentals: 0, completedRentals: 0, ...}
├─ preferences: {notificationMethod: "both", ...}
├─ status: "active"
├─ createdAt: timestamp
└─ updatedAt: timestamp
```

### Updated Collection: `rentals`
```
Document ID: "rental_1702660000000_xyz"

NEW/UPDATED Fields:
├─ playerId: "073-1234567"         ← NEW
├─ status: "pending" | "cancelled" | "completed" | "active"
├─ cancelledAt: null               ← NEW
├─ cancelledBy: null               ← NEW
├─ cancellationReason: null        ← NEW
├─ refundStatus: null              ← NEW
├─ history: [{action, timestamp, by, changes}]  ← NEW
├─ createdBy: "073-1234567"        ← NEW
└─ updatedBy: null                 ← NEW

KEEP:
├─ rentalId, cartId, startTime, endTime, holes, price, notes
└─ createdAt
```

---

## Summary of Changes

| File | Type | Lines | Changes |
|------|------|-------|---------|
| `PlayerIdInput.tsx` | NEW | ~80 | Format validation, lookup, display |
| `BookingHistory.tsx` | NEW | ~60 | Timeline display, action icons |
| `firestore.ts` | NEW | ~200 | All DB queries and mutations |
| `BookingForm.tsx` | UPDATE | +50 | Add player fields, auto-fill, cancellation |
| `AvailabilityGrid.tsx` | UPDATE | +30 | 10-min slots, new query logic |
| `UserApp.tsx` | UPDATE | +40 | New step 0, player flow |
| **TOTAL** | | ~460 | **Complete system upgrade** |

---

## Testing Commands (After Implementation)

```typescript
// Test 1: Create new player
await createPlayer({
  playerId: "073-1234567",
  name: "John Doe",
  email: "john@example.no",
  phone: "+4798765432",
  isMember: true
});

// Test 2: Lookup player
const player = await lookupPlayer("073-1234567");
console.log(player); // Should return player data

// Test 3: Check availability (10-min slots)
const slots = await checkAvailability(1, "2025-12-05", 18);
console.log(slots); // Should show 54 slots with available/booked

// Test 4: Create rental
const rentalId = await createRental({
  playerId: "073-1234567",
  cartId: 1,
  startTime: new Date("2025-12-05T10:00"),
  endTime: new Date("2025-12-05T14:00"),
  holes: 18,
  numPlayers: 4,
  price: 450
});

// Test 5: Cancel rental
await cancelRental(rentalId, "073-1234567", "too_busy");
```

---

**Ready to see this implemented? Say "OK" and I'll start coding!** 🚀
