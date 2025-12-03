# GDPR Compliance

## Region Configuration

All Firebase services are configured to run in EU regions for GDPR compliance:

### Cloud Functions
- **Region**: `europe-west1` (Belgium)
- **Configuration**: All HTTP functions explicitly set region using `.region('europe-west1')`
- **Functions**:
  - `createRental(europe-west1)`
  - `checkAvailability(europe-west1)`

### Firestore Database
- **Location**: `europe-west1` (must be configured during database creation)
- **Data residency**: All member data, rental records, and booking information stored in EU

### Client Configuration
- Firebase client (`admin/src/firebase.ts`) configured with:
  ```typescript
  export const functions = getFunctions(app, 'europe-west1');
  ```

## Migration from US Regions

If functions were previously deployed to `us-central1`:

1. Deploy new functions to `europe-west1`
2. Delete old US region functions:
   ```bash
   firebase functions:delete checkAvailability --region=us-central1 --force
   firebase functions:delete createRental --region=us-central1 --force
   ```
3. Redeploy hosting to ensure client connects to EU endpoints

## Verification

Confirm all services run in EU:
- Functions: Check Firebase Console → Functions
- Firestore: Check Firebase Console → Firestore Database → Settings
- Function URLs should contain `europe-west1`

## Important Notes

- **Never deploy functions without explicit region** - defaults to `us-central1`
- **Firestore location cannot be changed** after database creation
- Keep all data processing within EU boundaries per GDPR Article 44
