# Sikkerhetsmodell

Sikkerheten i GolfChart er basert på Firebase Security Rules, Custom Claims, og defense-in-depth prinsippet.

## Firestore Security Rules

### Overordnet strategi

Alle Firestore Security Rules validerer:

1. **Autentisering** — Bruker må være innlogget
2. **ClubId matching** — Bruker må ha tilgang til riktig klubb via custom claims
3. **Role-basert tilgang** — Ulike roller har ulike operasjoner

### Komplett firestore.rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             request.auth.token.role == role;
    }
    
    function hasAnyRole(roles) {
      return isAuthenticated() && 
             request.auth.token.role in roles;
    }
    
    function hasClubAccess(clubId) {
      return isAuthenticated() && 
             clubId in request.auth.token.clubs;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && 
             request.auth.uid == userId;
    }
    
    // --- CLUBS ---
    match /clubs/{clubId} {
      // Alle autentiserte kan lese klubber de har tilgang til
      allow read: if hasClubAccess(clubId);
      
      // Kun superadmin kan opprette nye klubber
      allow create: if hasRole('superadmin');
      
      // ClubAdmin og superadmin kan oppdatere
      allow update: if hasClubAccess(clubId) && 
                       hasAnyRole(['superadmin', 'clubAdmin']);
      
      // Kun superadmin kan slette
      allow delete: if hasRole('superadmin');
    }
    
    // --- PRICING RULES ---
    match /pricingRules/{ruleId} {
      allow read: if hasClubAccess(resource.data.clubId);
      
      allow create, update: if hasClubAccess(request.resource.data.clubId) &&
                               hasAnyRole(['superadmin', 'clubAdmin']);
      
      allow delete: if hasRole('superadmin');
    }
    
    // --- CARTS ---
    match /carts/{cartId} {
      allow read: if hasClubAccess(resource.data.clubId);
      
      // Staff, clubAdmin, superadmin kan opprette/oppdatere
      allow create, update: if hasClubAccess(request.resource.data.clubId) &&
                               hasAnyRole(['superadmin', 'clubAdmin', 'staff']);
      
      allow delete: if hasRole('superadmin');
    }
    
    // --- RENTALS ---
    match /rentals/{rentalId} {
      allow read: if hasClubAccess(resource.data.clubId);
      
      // Staff, clubAdmin, superadmin kan opprette/oppdatere
      allow create, update: if hasClubAccess(request.resource.data.clubId) &&
                               hasAnyRole(['superadmin', 'clubAdmin', 'staff']) &&
                               request.resource.data.clubId == resource.data.clubId; // Forhindre clubId-endring
      
      allow delete: if hasRole('superadmin');
    }
    
    // --- MAINTENANCE LOGS ---
    match /maintenanceLogs/{logId} {
      allow read: if hasClubAccess(resource.data.clubId);
      
      // Alle med staff+ kan logge vedlikehold
      allow create: if hasClubAccess(request.resource.data.clubId) &&
                       hasAnyRole(['superadmin', 'clubAdmin', 'staff']) &&
                       request.resource.data.byUser == request.auth.uid; // Må logge seg selv
      
      // Ingen kan endre eller slette logs (audit trail)
      allow update, delete: if false;
    }
    
    // --- USERS ---
    match /users/{userId} {
      // Brukere kan lese sin egen profil
      allow read: if isOwner(userId);
      
      // Admins kan lese alle brukere i sine klubber
      allow read: if hasAnyRole(['superadmin', 'clubAdmin']) &&
                     hasClubAccess(resource.data.clubs[0]); // Sjekk minst én klubb
      
      // Kun superadmin kan opprette/oppdatere brukere
      allow create, update: if hasRole('superadmin');
      
      allow delete: if hasRole('superadmin');
    }
    
    // --- MESSAGES ---
    match /messages/{messageId} {
      // Kun admins kan se meldingslogg
      allow read: if hasClubAccess(resource.data.clubId) &&
                     hasAnyRole(['superadmin', 'clubAdmin']);
      
      // Kun Cloud Functions kan skrive (via Admin SDK)
      allow create, update, delete: if false;
    }
    
    // --- REPORTS ---
    match /reports/{reportId} {
      allow read: if hasClubAccess(resource.data.clubId) &&
                     hasAnyRole(['superadmin', 'clubAdmin']);
      
      // Kun Cloud Functions kan generere rapporter
      allow create, update, delete: if false;
    }
    
    // Blokker alt annet
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Custom Claims

### Struktur

Custom claims settes av en Cloud Function ved brukeropprettelse:

```typescript
// functions/src/auth.ts
interface CustomClaims {
  role: 'superadmin' | 'clubAdmin' | 'staff' | 'viewer';
  clubs: string[];  // ["ski-gk", "holmenkollen-gk"]
}

export const setUserRole = onCall(async (data, context) => {
  // Kun superadmin kan sette roller
  if (context.auth?.token.role !== 'superadmin') {
    throw new HttpsError('permission-denied', 'Kun superadmin');
  }
  
  const { uid, role, clubs } = data;
  
  await admin.auth().setCustomUserClaims(uid, {
    role,
    clubs
  });
  
  // Oppdater også Firestore users-dokument
  await admin.firestore().doc(`users/${uid}`).update({
    roles: [role],
    clubs,
    updatedAt: FieldValue.serverTimestamp()
  });
  
  return { success: true };
});
```

### Rollehierarki

```
superadmin
  ├── Tilgang til ALLE klubber
  ├── Kan opprette nye klubber
  ├── Kan administrere brukere
  └── Kan slette data
  
clubAdmin
  ├── Tilgang til egne klubber (clubs array)
  ├── Kan endre prisregler
  ├── Kan se rapporter
  └── Kan administrere carts
  
staff
  ├── Tilgang til egne klubber
  ├── Kan opprette/avslutte rentals
  ├── Kan endre cart status
  └── Lesetilgang til rapporter
  
viewer
  ├── Kun lesetilgang
  └── Kan ikke endre noe
```

## Frontend autentisering

### Admin UI

```typescript
// admin/src/contexts/AuthContext.tsx
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);
  
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdTokenResult();
        setClaims(token.claims as CustomClaims);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setClaims(null);
      }
    });
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, claims, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Routes

```typescript
// admin/src/components/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: ReactNode; 
  requiredRole?: CustomClaims['role'];
}) {
  const { user, claims } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && claims?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}
```

## Cloud Functions sikkerhet

### Validering i Functions

Alle callable functions må validere tilgang:

```typescript
// functions/src/rentals.ts
export const createRental = onCall(async (data, context) => {
  // 1. Sjekk autentisering
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'Ikke innlogget');
  }
  
  // 2. Sjekk rolle
  const role = context.auth.token.role as string;
  if (!['superadmin', 'clubAdmin', 'staff'].includes(role)) {
    throw new HttpsError('permission-denied', 'Mangler tilgang');
  }
  
  // 3. Sjekk clubId matching
  const { clubId } = data;
  const userClubs = context.auth.token.clubs as string[];
  
  if (!userClubs.includes(clubId)) {
    throw new HttpsError('permission-denied', 'Ikke tilgang til denne klubben');
  }
  
  // 4. Valider input
  const { cartId, renterName, holes } = data;
  if (!cartId || !renterName || ![9, 18].includes(holes)) {
    throw new HttpsError('invalid-argument', 'Ugyldig data');
  }
  
  // 5. Utfør operasjon med Admin SDK (bypasser security rules)
  const db = admin.firestore();
  // ... resten av logikken
});
```

### Rate limiting

Bruk Firebase App Check og Cloud Armor:

```typescript
// functions/src/index.ts
import { onCall } from 'firebase-functions/v2/https';

export const createRental = onCall(
  {
    enforceAppCheck: true,  // Krever gyldig App Check token
    consumeAppCheckToken: true,
    cors: ['https://golfchart.app']
  },
  async (data, context) => {
    // Handler her
  }
);
```

## Secrets management

Aldri hardkod API-nøkler i kode. Bruk Firebase Secret Manager:

```pwsh
# Sett secrets
firebase functions:secrets:set SENDGRID_API_KEY
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set GEMINI_API_KEY
```

Bruk i functions:

```typescript
// functions/src/notifications.ts
import { defineSecret } from 'firebase-functions/params';

const sendgridKey = defineSecret('SENDGRID_API_KEY');

export const sendEmail = onCall(
  { secrets: [sendgridKey] },
  async (data, context) => {
    const apiKey = sendgridKey.value();
    // Bruk apiKey
  }
);
```

## CORS og CSP

### Firebase Hosting headers

```json
// firebase.json
{
  "hosting": {
    "public": "admin/dist",
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          }
        ]
      }
    ]
  }
}
```

## Logging og monitoring

### Frontend feilrapportering

Bruk Sentry eller Firebase Crashlytics:

```typescript
// admin/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1
});
```

### Cloud Functions logging

```typescript
import { logger } from 'firebase-functions/v2';

export const createRental = onCall(async (data, context) => {
  logger.info('createRental called', {
    uid: context.auth?.uid,
    clubId: data.clubId,
    cartId: data.cartId
  });
  
  try {
    // ... operasjon
    logger.info('Rental created successfully', { rentalId });
  } catch (error) {
    logger.error('Failed to create rental', error);
    throw new HttpsError('internal', 'Noe gikk galt');
  }
});
```

## Security checklist

- [ ] Firestore Security Rules er deployet og testet
- [ ] Custom Claims er konfigurert for alle brukere
- [ ] Cloud Functions validerer auth og clubId i hver request
- [ ] Secrets er lagret i Secret Manager (ikke i kode)
- [ ] CORS er konfigurert riktig i firebase.json
- [ ] CSP headers er satt for hosting
- [ ] Rate limiting er aktivert (App Check)
- [ ] Logging og monitoring er satt opp
- [ ] Security review er gjennomført før produksjon

## Neste steg

- [Multi-tenancy design](multi-tenant.md) — ClubId-isolasjon i praksis
- [API dokumentasjon](../api/auth.md) — Auth endpoints og flows
- [Deployment guide](../deployment/production.md) — Sikker produksjons-deployment
