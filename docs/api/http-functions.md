# Firebase Functions HTTP Implementation

## Architecture

Cloud Functions use HTTP endpoints (not callable functions) for client communication.

### Server Implementation

Functions defined in `functions/src/index.ts`:

```typescript
export const createRental = functions
  .region('europe-west1')
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      // Handle POST request
      const data = req.body as CreateRentalRequest;
      // Transactional booking logic
    });
  });

export const checkAvailability = functions
  .region('europe-west1')
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      // Handle GET request with query params
      const { date, time, holes } = req.query;
      // Return available cart IDs
    });
  });
```

### Client Implementation

Client calls HTTP endpoints directly via `fetch` in `admin/src/firebaseService.ts`:

```typescript
export const checkAvailability = async (
  date: string, 
  time: string, 
  holes: 9 | 18
): Promise<{ available: number, availableCartIds: number[] }> => {
  const region = 'europe-west1';
  const projectId = 'golfbilkontroll-skigk';
  const baseUrl = `https://${region}-${projectId}.cloudfunctions.net`;
  const url = `${baseUrl}/checkAvailability?date=${date}&time=${time}&holes=${holes}`;
  
  const resp = await fetch(url, { method: 'GET' });
  const data = await resp.json();
  return {
    available: data.availableCartIds.length,
    availableCartIds: data.availableCartIds
  };
};
```

## Why HTTP Instead of Callable?

1. **CORS Flexibility**: Custom CORS handler allows precise origin control
2. **Direct Testing**: Can test endpoints with curl/Postman without auth
3. **Simpler Debugging**: Standard HTTP status codes and error responses
4. **Region Control**: Explicit region configuration for GDPR compliance

## Function URLs

Production endpoints (europe-west1):
- **createRental**: `https://europe-west1-golfbilkontroll-skigk.cloudfunctions.net/createRental`
- **checkAvailability**: `https://europe-west1-golfbilkontroll-skigk.cloudfunctions.net/checkAvailability`

## Testing

```bash
# Check availability
curl "https://europe-west1-golfbilkontroll-skigk.cloudfunctions.net/checkAvailability?date=2025-12-03&time=10:00&holes=18"

# Create rental (POST)
curl -X POST https://europe-west1-golfbilkontroll-skigk.cloudfunctions.net/createRental \
  -H "Content-Type: application/json" \
  -d '{"cartId":1,"renterName":"Test","startTime":"2025-12-03T10:00:00Z","holes":18,"price":400}'
```

## Migration Notes

If you see `httpsCallable` errors:
1. Functions were likely deployed without `.region()` → went to us-central1
2. Client tried to call as callable functions → failed
3. Solution: Deploy with `.region('europe-west1')` and use HTTP fetch
