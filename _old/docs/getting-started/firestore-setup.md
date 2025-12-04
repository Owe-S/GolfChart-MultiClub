# Firestore Database Setup

## Initial Setup Required

**CRITICAL**: The Firestore API must be enabled before the app can function.

### Step 1: Enable Firestore

1. Visit [Firebase Console](https://console.firebase.google.com/project/golfbilkontroll-skigk/firestore)
2. Click **"Create database"**
3. **Select location**: `europe-west1` (Belgium) for GDPR compliance
4. **Start in**: Production mode (security rules already configured in `firestore.rules`)

### Step 2: Initialize Golf Carts

Once Firestore is created, initialize the database with golf carts:

1. Open the app: https://golfbilkontroll-skigk.web.app
2. Look for the **🛠️ Reset DB** button (visible in dev mode)
3. Click to create 5 golf carts:
   - Blå 4 (ID: 1)
   - Blå 5 (ID: 2)
   - Grønn (ID: 3)
   - Hvit (ID: 4)
   - Svart (ID: 5)

Or manually via Firebase Console:

Create collection `carts` with documents:

```
Document ID: "1"
{
  id: 1,
  name: "Blå 4",
  status: "available",
  currentRentalId: null
}

Document ID: "2"
{
  id: 2,
  name: "Blå 5",
  status: "available",
  currentRentalId: null
}
...
```

### Step 3: Verify Connection

After Firestore is created:
- Calendar should load
- Availability grid should show time slots
- Can select dates and times
- Booking flow should work

## Error States

### "Laster tilgjengelighet..." Never Completes
**Cause**: Firestore API not enabled

**Solution**: Follow Step 1 above

### 403 Errors in Console
**Cause**: Firestore API disabled or wrong project

**Check**: 
```bash
firebase firestore:databases:list
```

Should show `(default)` database in `europe-west1`

### Empty Availability Grid
**Cause**: No carts in database

**Solution**: Follow Step 2 above

## Security Rules

Production rules in `firestore.rules`:
- Public read access to `carts` and `rentals`
- Admin-only write access (when auth is implemented)
- Member number privacy protection

## Collections Structure

### carts
```
carts/{cartId}
  - id: number
  - name: string
  - status: "available" | "rented" | "maintenance"
  - currentRentalId: string | null
```

### rentals
```
rentals/{rentalId}
  - cartId: number
  - renterName: string
  - startTime: timestamp (ISO string)
  - endTime: timestamp (ISO string)
  - holes: 9 | 18
  - price: number
  - isMember: boolean
  - membershipNumber: string (optional)
  - contactInfo: string
  - notificationMethod: "email" | "sms"
  - createdAt: timestamp
```

## GDPR Compliance

- Database **must** be in `europe-west1`
- Cannot change location after creation
- All booking data stays in EU
- Member numbers stored but access controlled via security rules
