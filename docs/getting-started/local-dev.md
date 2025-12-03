# Lokal utviklingsmiljø

Denne guiden viser hvordan du setter opp et komplett lokalt utviklingsmiljø for GolfChart med Firebase Emulator Suite.

## Forutsetninger

- **Node.js:** 18 eller nyere ([last ned](https://nodejs.org/))
- **pnpm:** Foretrukket package manager ([installer](https://pnpm.io/installation))
- **Firebase CLI:** Installert globalt (se [Firebase Setup](firebase-setup.md))
- **Java:** JDK 11+ for Firestore emulator ([AdoptOpenJDK](https://adoptium.net/))
- **Git:** For versjonskontroll

## Prosjektstruktur

```
GolfChartAppV0.9/
├── admin/                  # Admin UI (React + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── functions/              # Cloud Functions (Node + TypeScript)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── public/                 # Public UI (eksisterende app)
├── docs/                   # MkDocs dokumentasjon
├── firebase.json           # Firebase config
├── firestore.rules         # Security rules
├── firestore.indexes.json  # Firestore indekser
└── mkdocs.yml              # Dokumentasjon config
```

## Installasjon

### 1. Klon repository

```pwsh
git clone https://github.com/yourusername/golfchart.git
cd golfchart
```

### 2. Installer dependencies

**Root og Functions:**

```pwsh
# Installer Firebase Functions dependencies
cd functions
pnpm install
cd ..
```

**Admin UI:**

```pwsh
cd admin
pnpm install
cd ..
```

### 3. Konfigurer miljøvariabler

**Admin UI (.env.local):**

```pwsh
# admin/.env.local
VITE_FIREBASE_API_KEY=din-api-key
VITE_FIREBASE_AUTH_DOMAIN=golfbilkontroll-skigk.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=golfbilkontroll-skigk
VITE_FIREBASE_STORAGE_BUCKET=golfbilkontroll-skigk.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_USE_EMULATOR=true
```

**Functions (.env):**

```pwsh
# functions/.env
SENDGRID_API_KEY=test-key-for-local
TWILIO_AUTH_TOKEN=test-token-for-local
GEMINI_API_KEY=test-gemini-key
```

> **Tips:** For lokal utvikling kan du bruke dummy-verdier for eksterne API-nøkler.

## Firebase Emulator Suite

### Starte emulatorer

```pwsh
firebase emulators:start
```

Dette starter:

- 🔥 **Firestore** på `localhost:8080`
- 🔐 **Auth** på `localhost:9099`
- ⚡ **Functions** på `localhost:5001`
- 📦 **Storage** på `localhost:9199`
- 🎛️ **Emulator UI** på `localhost:4000`

### Emulator UI

Åpne http://localhost:4000 for å:

- Se Firestore data
- Administrere Auth brukere
- Inspisere Function logs
- Teste Storage filer

### Importere testdata

Opprett seed-data for utvikling:

```pwsh
# functions/src/seed.ts
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function seed() {
  // Opprett testklubb
  await db.doc('clubs/ski-gk').set({
    name: 'Ski Golfklubb',
    slug: 'ski-gk',
    active: true,
    contact: {
      email: 'test@skigk.no',
      phone: '+47 12345678'
    },
    timezone: 'Europe/Oslo',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Opprett prisregler
  await db.collection('pricingRules').add({
    clubId: 'ski-gk',
    holes18: { member: 350, nonMember: 425 },
    holes9: { member: 200, nonMember: 250 },
    doctorsNoteDiscount: 50,
    effectiveFrom: admin.firestore.Timestamp.now(),
    effectiveTo: null
  });
  
  // Opprett 3 carts
  for (let i = 1; i <= 3; i++) {
    await db.collection('carts').add({
      clubId: 'ski-gk',
      status: 'available',
      label: `Bil ${i}`,
      serial: `GOLF-2023-00${i}`,
      notes: '',
      currentRentalId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  console.log('✅ Seed data created');
}

seed().catch(console.error);
```

**Kjør seeding:**

```pwsh
cd functions
npx ts-node src/seed.ts
```

## Utviklingsworkflow

### 1. Start alle tjenester

**Terminal 1 (Emulatorer):**

```pwsh
firebase emulators:start
```

**Terminal 2 (Admin UI dev server):**

```pwsh
cd admin
pnpm dev
```

Admin UI er nå tilgjengelig på http://localhost:5173

**Terminal 3 (Functions watch - valgfritt):**

```pwsh
cd functions
pnpm build --watch
```

### 2. Administrere testbrukere

Opprett en testbruker via Emulator UI eller via Firebase CLI:

```pwsh
firebase auth:import users.json --project golfbilkontroll-skigk
```

**users.json:**

```json
{
  "users": [
    {
      "localId": "test-admin-123",
      "email": "admin@skigk.no",
      "passwordHash": "...",
      "displayName": "Test Admin",
      "customClaims": "{\"role\":\"clubAdmin\",\"clubs\":[\"ski-gk\"]}"
    }
  ]
}
```

Eller opprett manuelt i Emulator UI (<http://localhost:4000/auth>) med en enkel passord-autentisering.

### 3. Hot reload

- **Admin UI:** Vite hot-reloader ved filendringer
- **Functions:** Emulator restarter automatisk ved endringer i build-output
- **Firestore Rules:** Deploy med `firebase deploy --only firestore:rules`

### 4. Debugging

**Frontend (Chrome DevTools):**

```typescript
// admin/src/firebase.ts
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  console.log('🔧 Using Firebase Emulators');
}
```

**Functions (VS Code debugger):**

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Functions",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/functions/lib/**/*.js"]
    }
  ]
}
```

Start emulators med inspect:

```pwsh
firebase emulators:start --inspect-functions
```

## Testing

### Unit tests (Admin UI)

```pwsh
cd admin
pnpm test
```

**Eksempel test:**

```typescript
// admin/src/components/__tests__/CartCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CartCard } from '../CartCard';

test('viser cart status', () => {
  render(<CartCard cart={{ label: 'Bil 1', status: 'available' }} />);
  expect(screen.getByText('Bil 1')).toBeInTheDocument();
  expect(screen.getByText('Tilgjengelig')).toBeInTheDocument();
});
```

### Security Rules tests

```pwsh
cd functions
pnpm test:rules
```

**Eksempel test:**

```typescript
// tests/firestore-rules.test.ts
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

test('klubbadmin kan lese egne klubber', async () => {
  const db = testEnv.authenticatedContext('user123', {
    role: 'clubAdmin',
    clubs: ['ski-gk']
  }).firestore();
  
  await assertSucceeds(
    db.collection('rentals').where('clubId', '==', 'ski-gk').get()
  );
});
```

### Integration tests (Functions)

```pwsh
cd functions
pnpm test:integration
```

## Dokumentasjon (MkDocs)

### Installere MkDocs

```pwsh
pip install mkdocs-material mkdocs-git-revision-date-localized-plugin
```

### Kjøre docs lokalt

```pwsh
mkdocs serve
```

Dokumentasjon er tilgjengelig på http://localhost:8000

### Bygge docs

```pwsh
mkdocs build
```

Genererer statiske filer i `site/` som kan deployes til GitHub Pages eller Firebase Hosting.

## Feilsøking

### Problem: Firestore emulator starter ikke

**Løsning:** Sjekk at port 8080 ikke er i bruk:

```pwsh
netstat -ano | findstr :8080
```

Kill prosess eller endre port i `firebase.json`:

```json
{
  "emulators": {
    "firestore": {
      "port": 8081
    }
  }
}
```

### Problem: Auth emulator har ingen brukere

**Løsning:** Opprett manuelt i Emulator UI (<http://localhost:4000/auth>) eller importer `users.json`.

### Problem: Functions kan ikke nå Firestore

**Løsning:** Sørg for at Functions bruker emulator:

```typescript
// functions/src/index.ts (for testing)
if (process.env.FUNCTIONS_EMULATOR) {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
}
```

### Problem: CORS-feil i Admin UI

**Løsning:** Legg til CORS i Functions:

```typescript
// functions/src/index.ts
import { onCall } from 'firebase-functions/v2/https';

export const myFunction = onCall(
  { cors: ['http://localhost:5173'] },
  async (data, context) => {
    // ...
  }
);
```

## Neste steg

- [Firebase Setup](firebase-setup.md) — Deploy til produksjon
- [Admin UI oversikt](../admin-ui/overview.md) — Utvikle UI-komponenter
- [API dokumentasjon](../api/overview.md) — Cloud Functions referanse
- [Testing guide](../contributing/testing.md) — Skriv gode tester
