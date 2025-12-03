# Multi-tenancy design

GolfChart bruker en **shared database med clubId-basert isolasjon** for å støtte flere golfklubber i samme Firebase-prosjekt.

## Designvalg

### Shared vs Separate projects

Vi valgte **shared database** fremfor separate Firebase-prosjekter per klubb:

**Fordeler:**

- ✅ Enklere vedlikehold (én kodebase, ett deployment)
- ✅ Kostnadseffektivt for små klubber
- ✅ Sentralisert logging og monitoring
- ✅ Enklere brukeradministrasjon (én Auth pool)

**Ulemper:**

- ❌ Krever streng security rules-håndtering
- ❌ Alle queries må filtrere på clubId
- ❌ Risiko for data-lekkasje hvis security rules er feil

## ClubId-isolasjon

### Data modell

Alle Firestore-dokumenter har et `clubId` felt:

```typescript
interface BaseDocument {
  clubId: string;  // OBLIGATORISK
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Cart extends BaseDocument {
  // ... andre felter
}

interface Rental extends BaseDocument {
  // ... andre felter
}
```

### Query patterns

**❌ ALDRI gjør dette (global query):**

```typescript
// FARLIG: Returnerer data fra ALLE klubber
const snapshot = await getDocs(collection(db, 'rentals'));
```

**✅ ALLTID gjør dette (clubId-filtrert query):**

```typescript
// TRYGT: Kun data fra én klubb
const q = query(
  collection(db, 'rentals'),
  where('clubId', '==', currentClubId)
);
const snapshot = await getDocs(q);
```

### Custom React Hook

Lag en abstraksjon for å sikre clubId alltid er med:

```typescript
// admin/src/hooks/useClubQuery.ts
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export function useClubQuery<T>(
  collectionName: string,
  additionalFilters?: QueryConstraint[]
) {
  const { currentClubId } = useAuth();
  
  return useQuery({
    queryKey: [collectionName, currentClubId, ...additionalFilters],
    queryFn: async () => {
      if (!currentClubId) throw new Error('Ingen klubb valgt');
      
      const q = query(
        collection(db, collectionName),
        where('clubId', '==', currentClubId),
        ...(additionalFilters || [])
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    },
    enabled: !!currentClubId
  });
}
```

**Bruk:**

```typescript
// admin/src/pages/RentalsPage.tsx
const { data: rentals, isLoading } = useClubQuery<Rental>(
  'rentals',
  [orderBy('startTime', 'desc'), limit(50)]
);
```

## Bruker-klubb mapping

### Custom Claims

Brukere får en liste av klubber de har tilgang til:

```typescript
interface CustomClaims {
  role: 'superadmin' | 'clubAdmin' | 'staff' | 'viewer';
  clubs: string[];  // ["ski-gk", "holmenkollen-gk"]
}
```

### Klubbvelger i UI

Admin UI har en klubbvelger i headeren:

```typescript
// admin/src/components/ClubSelector.tsx
export function ClubSelector() {
  const { claims } = useAuth();
  const [currentClub, setCurrentClub] = useLocalStorage('currentClubId', '');
  
  const userClubs = claims?.clubs || [];
  
  if (claims?.role === 'superadmin') {
    // Superadmin ser alle klubber
    return <ClubDropdown clubs={allClubs} />;
  }
  
  // Andre roller ser kun sine klubber
  return <ClubDropdown clubs={userClubs} />;
}
```

## Security Rules validering

Firestore Security Rules håndhever clubId-isolasjon:

```javascript
// firestore.rules
function hasClubAccess(clubId) {
  return request.auth != null && 
         clubId in request.auth.token.clubs;
}

match /rentals/{rentalId} {
  // Les: Må ha tilgang til klubben
  allow read: if hasClubAccess(resource.data.clubId);
  
  // Skriv: Må ha tilgang OG clubId må matche i request
  allow create, update: if hasClubAccess(request.resource.data.clubId) &&
                           request.resource.data.clubId == resource.data.clubId;
}
```

**Viktig:** `request.resource.data.clubId == resource.data.clubId` forhindrer at noen endrer clubId på eksisterende dokumenter.

## Cloud Functions isolasjon

Cloud Functions må validere clubId-tilgang:

```typescript
// functions/src/rentals.ts
export const createRental = onCall(async (data, context) => {
  const { clubId, cartId, renterName } = data;
  const userClubs = context.auth?.token.clubs as string[];
  
  // Valider at bruker har tilgang til klubben
  if (!userClubs.includes(clubId)) {
    throw new HttpsError('permission-denied', 'Ikke tilgang til denne klubben');
  }
  
  // Valider at cart tilhører klubben
  const cartDoc = await admin.firestore().doc(`carts/${cartId}`).get();
  if (!cartDoc.exists || cartDoc.data()?.clubId !== clubId) {
    throw new HttpsError('invalid-argument', 'Ugyldig cart for denne klubben');
  }
  
  // Fortsett med transaksjon...
});
```

## Testing av isolasjon

### Unit tests

Test at queries alltid inkluderer clubId:

```typescript
// admin/src/hooks/__tests__/useClubQuery.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useClubQuery } from '../useClubQuery';

describe('useClubQuery', () => {
  it('should filter by clubId', async () => {
    const { result } = renderHook(() => useClubQuery('rentals'));
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // Alle dokumenter skal ha currentClubId
    result.current.data?.forEach(rental => {
      expect(rental.clubId).toBe('ski-gk');
    });
  });
  
  it('should throw if no clubId selected', () => {
    // Mock ingen klubb valgt
    const { result } = renderHook(() => useClubQuery('rentals'));
    
    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toContain('Ingen klubb valgt');
  });
});
```

### Integration tests

Test Security Rules med Firebase Emulator:

```typescript
// tests/security-rules.test.ts
import { 
  initializeTestEnvironment, 
  assertFails, 
  assertSucceeds 
} from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'golfchart-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8')
    }
  });
});

test('bruker kan kun lese egne klubbers data', async () => {
  const userContext = testEnv.authenticatedContext('user123', {
    clubs: ['ski-gk']
  });
  
  // Skal lykkes: Leser egen klubb
  await assertSucceeds(
    userContext.firestore()
      .collection('rentals')
      .where('clubId', '==', 'ski-gk')
      .get()
  );
  
  // Skal feile: Prøver å lese annen klubb
  await assertFails(
    userContext.firestore()
      .collection('rentals')
      .where('clubId', '==', 'holmenkollen-gk')
      .get()
  );
});
```

## Skalering

### Når én database ikke er nok

Hvis systemet vokser til **100+ klubber** eller har **svært ulike behov** (forskjellige regioner, compliance-krav), vurder:

#### 1. Database-per-region

```
Firebase Project: golfchart-norway
  └── Firestore (europe-north1)
      └── Klubber: ski-gk, holmenkollen-gk, ...

Firebase Project: golfchart-sweden
  └── Firestore (europe-north1)
      └── Klubber: stockholms-gk, ...
```

#### 2. Collection Groups

Bruk sub-collections for bedre sharding:

```
/clubs/{clubId}/rentals/{rentalId}
/clubs/{clubId}/carts/{cartId}
```

Query med collection groups:

```typescript
const q = query(
  collectionGroup(db, 'rentals'),
  where('clubId', '==', currentClubId)
);
```

**Fordel:** Automatisk sharding per klubb.

**Ulempe:** Mer komplekse security rules.

## Monitoring og alerts

### Datadog dashboard

Overvåk queries for å sikre at clubId alltid er med:

```json
{
  "query": "SELECT COUNT(*) FROM firestore_queries WHERE missing_clubId = true",
  "alert": {
    "threshold": 0,
    "message": "KRITISK: Query uten clubId-filter detektert!"
  }
}
```

### Cloud Functions metrics

Log clubId i alle function calls:

```typescript
import { logger } from 'firebase-functions/v2';

export const createRental = onCall(async (data, context) => {
  logger.info('createRental', {
    uid: context.auth?.uid,
    clubId: data.clubId,
    timestamp: new Date().toISOString()
  });
  // ...
});
```

Bygg dashboard som viser aktivitet per klubb.

## Best practices

### ✅ Do:

- Alltid inkluder clubId i alle Firestore queries
- Valider clubId i alle Cloud Functions
- Bruk custom hooks som abstraherer clubId-filtrering
- Test security rules grundig med emulator
- Logg clubId i alle logger for debugging
- Lag alerts for queries uten clubId

### ❌ Don't:

- ALDRI tillat global queries uten clubId
- ALDRI stol på frontend-validering alene
- ALDRI hardkod clubId (alltid hent fra context/claims)
- ALDRI tillat clubId-endring på eksisterende dokumenter
- ALDRI glem å teste cross-club access scenarios

## Neste steg

- [Sikkerhetsmodell](security.md) — Security Rules i detalj
- [Datamodell](data-model.md) — Firestore collections og struktur
- [API dokumentasjon](../api/firestore.md) — Query patterns og best practices
