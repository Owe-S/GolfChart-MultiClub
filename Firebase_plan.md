# Firebase plan – GolfChartApp (multi-klubb, backoffice først)

Dato: 2025-11-17
Status: Klargjøring og beslutninger for Firebase-backend og admin backoffice.

## TL;DR

- Vi bygger først admin/backoffice på Firebase (Hosting + Firestore + Functions + Auth), public UI beholdes inntil videre.
- Region: `europe-west1`. Miljøer: `dev`, `stage`, `prod` (separate prosjekter/aliaser).
- Datamodell er multi-klubb via `clubId` på alle dokumenter; strenge Firestore-regler med custom claims.
- Første funksjoner: `createRental`, `endRental`, `calculatePrice`, `sendReminder`, `generateReport`, `provisionClub`, `aiAssist`.
- Neste økt: sjekk inn `firestore.rules`, functions-skjelett (TypeScript), og bootstrap Admin SPA.

Se også `NEXT_SESSION.md` for en kort, praktisk sjekkliste.

## Beslutningslogg (Decision Log)

- [Besluttet] Hybrid strategi: Admin på Firebase; public UI endres senere.
- [Besluttet] Multi-klubb isolasjon med `clubId` + custom claims (`roles`, `clubIds`).
- [Besluttet] Bruke europe-west1 for alle tjenester for konsistens/latens.
- [Planlagt] Notifikasjoner via SendGrid (e-post) og Twilio (SMS) bak Cloud Functions.

## Antakelser

- Klubbenes medlemsnummer-format er tilstrekkelig for å avgjøre `isMember` (eks: starter med `73-`).
- Priser er enkle regler (9/18 hull, medlem/ikke, legeerklæring-rabatt) i første versjon.
- Ingen eksisterende backend-låsninger som hindrer Firebase-adopsjon.

## Åpne spørsmål (avklares tidlig)

- Trenger vi SSO/IdP for ansatte (Azure AD/Google Workspace) eller holder Email/Password?
- Påminnelse offset standard (f.eks. 2 t før start) og kan den variere per klubb?
- Behov for audit-logg på skriveoperasjoner utover Cloud Logging?

## Risikoer og avbøtende tiltak

- Kost ved feil indekser/queries: hold queries enkle og legg nødvendige indekser (se under).
- Nøkkelhåndtering: bruk `functions:config`/Secret Manager, aldri hardkode.
- Overlapping av leier: bruk Firestore-transaksjoner i `createRental`/`endRental`.

## Mål og tilnærming

- Støtte flere klubber med delt kodebase og strikt data-isolasjon per klubb.
- Prioriter backoffice (admin) først: drift, priser, utleie, rapporter, varsling.
- Behold eksisterende offentlig UI uendret nå; bygg nytt sluttbrukerlag oppå stabil admin senere.

## Hvor applikasjonen skal kjøre (valg og anbefaling)

- Alternativer:
  - A) Fullt på Firebase (Hosting, Firestore, Auth, Functions, Storage).
  - B) Fortsatt eksisterende hosting for public, men Firebase som backend (API/DB) for ny admin.
  - C) Hybrid: Admin på Firebase; public UI kan embeddes/integreres etter hvert.
- Anbefaling: C (Hybrid) nå. Admin backoffice på Firebase Hosting + Cloud Functions + Firestore. Behold nåværende public-løsning uendret; bygg nytt sluttbruker-UI senere.
- Region: `europe-west1` (lav latens for Norge, konsistent på Functions, Firestore og Storage).
- Miljøer: `dev`, `stage`, `prod` (separate Firebase-prosjekter eller aliaser).

## Firebase-tjenester i bruk

- Auth: Email/Password (+ valgfritt Google OAuth), custom claims for roller og klubbrettigheter.
- Firestore (Native mode): Primær database. Strenge sikkerhetsregler basert på `clubId` + roller.
- Cloud Functions (Node/TypeScript): Forretningslogikk (pris, utleie, rapporter, varsler, AI-proxy).
- Hosting: Admin SPA (React/Vite). Evt. public UI når klart.
- Storage: Eksportfiler (CSV/JSON), bil-/vedlikeholdsbilder.
- Cloud Scheduler (via HTTP) + Functions: Planlagte påminnelser/rydding (valgfritt senere).

## Prosjektoppsett (CLI – PowerShell)

```pwsh
# Installer Firebase CLI (globalt)
npm i -g firebase-tools
firebase login

# Opprett eller koble til prosjekter (bruk eksisterende ID-er om de finnes)
firebase projects:create golfchart-dev --display-name "GolfChart Dev"
firebase projects:create golfchart-stage --display-name "GolfChart Stage"
firebase projects:create golfchart-prod --display-name "GolfChart Prod"

# I repo-roten (denne mappen), initialiser Firebase (velg: Firestore, Functions, Hosting, Storage)
firebase init

# Sett aliaser for miljøer
firebase use --add
# Velg dev -> golfchart-dev, stage -> golfchart-stage, prod -> golfchart-prod

# Standard region for Functions
# (i functions/.runtimeconfig eller ved init: europe-west1)

# Konfigurer secrets (lagres i Firebase, ikke i repo)
firebase functions:config:set sendgrid.key="<SENDGRID_API_KEY>"
firebase functions:config:set twilio.sid="<TWILIO_SID>" twilio.token="<TWILIO_TOKEN>"
firebase functions:config:set ai.gemini_api_key="<GEMINI_API_KEY>"

# Deploy (kun etter at regler/funcs/hosting er på plass)
# Dev først
firebase use dev
firebase deploy --only firestore:rules,functions,hosting,storage
```

Merk: Ikke sjekk inn nøkler i repo. Bruk `functions:config` eller Secret Manager.

## Datamodell (Firestore)

Alle dokumenter tagges med `clubId` for multi-tenancy. Nøkkelkolleksjoner:

- `clubs/{clubId}`
  - `name`, `slug`, `active`, `contact`, `timezone` (f.eks. `Europe/Oslo`).
- `pricingRules/{ruleId}`
  - `clubId`, `holes18.member`, `holes18.nonMember`, `holes9.member`, `holes9.nonMember`, `doctorsNoteDiscount`.
- `carts/{cartId}`
  - `clubId`, `status` (available|rented|out_of_order), `label`, `serial`, `notes`.
- `rentals/{rentalId}`
  - `clubId`, `cartId`, `renterName`, `membershipNumber`, `isMember`, `hasDoctorsNote`, `holes` (9|18), `price`, `paymentMethod`, `startTime`, `endTime`, `notificationMethod`, `contactInfo`, `reminderSent`, `notes`.
- `maintenanceLogs/{logId}`
  - `clubId`, `cartId`, `statusBefore`, `statusAfter`, `reason`, `timestamp`, `byUser`.
- `users/{uid}`
  - Speiler offentlig profil (ikke sensitivt), `clubs` (liste), `roles` (lokal visning av claims).
- `reports/{reportId}`
  - `clubId`, `type`, `range`, `status`, `storagePath`, `createdAt`.
- `messages/{messageId}`
  - `clubId`, `method` (email|sms), `to`, `templateId|body`, `status`, `retries`, `error`.
- `aiContextSnapshots/{snapshotId}` (valgfritt for caching)
  - `clubId`, `generatedAt`, `summary`, `metrics`.

Eksempel `rentals` dokument:

```json
{
  "clubId": "ski-gk",
  "cartId": "cart-1",
  "renterName": "Ola Nordmann",
  "membershipNumber": "73-12345",
  "isMember": true,
  "hasDoctorsNote": false,
  "holes": 18,
  "price": 350,
  "paymentMethod": "Kort",
  "startTime": "2025-11-17T09:00:00.000Z",
  "endTime": null,
  "notificationMethod": "email",
  "contactInfo": "ola@example.com",
  "reminderSent": false,
  "notes": "Forhåndsbooket online."
}
```

### Indekser (anbefalt)

- `rentals`: composite index på `(clubId ASC, startTime DESC)`
- `carts`: `(clubId ASC, status ASC)`
- `maintenanceLogs`: `(cartId ASC, timestamp DESC)`

## Roller og autentisering

- Roller via custom claims: `superadmin`, `clubAdmin`, `staff`, `viewer`.
- Claims eksempel:

```json
{
  "roles": ["clubAdmin"],
  "clubIds": ["ski-gk"]
}
```

## Firestore-regler (skjelett)

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function hasClub(clubId) {
      return request.auth != null && clubId in request.auth.token.clubIds;
    }
    function hasRole(role) {
      return request.auth != null && role in request.auth.token.roles;
    }

    match /rentals/{id} {
      allow read: if hasClub(resource.data.clubId);
      allow create: if hasClub(request.resource.data.clubId)
        && (hasRole('staff') || hasRole('clubAdmin') || hasRole('superadmin'));
      allow update: if hasClub(resource.data.clubId)
        && (hasRole('staff') || hasRole('clubAdmin') || hasRole('superadmin'));
      allow delete: if hasRole('superadmin');
    }

    match /pricingRules/{id} {
      allow read: if hasClub(resource.data.clubId);
      allow write: if hasClub(resource.data.clubId)
        && (hasRole('clubAdmin') || hasRole('superadmin'));
    }

    match /carts/{id} {
      allow read: if hasClub(resource.data.clubId);
      allow update: if hasClub(resource.data.clubId)
        && (hasRole('staff') || hasRole('clubAdmin') || hasRole('superadmin'));
      allow create, delete: if hasRole('clubAdmin') || hasRole('superadmin');
    }

    match /clubs/{clubId} {
      allow read: if true; // Offentlig basismetadata
      allow write: if hasRole('superadmin');
    }
  }
}
```

## Cloud Functions (første bølge)

TypeScript-stubber (HTTP callable eller onCall):

```ts
// functions/src/index.ts
export const createRental = onCall(async (ctx, data) => {
  // Valider claims + clubId
  // Transaksjon: sjekk cart status, beregn pris (hent pricingRules), opprett rental, sett cart rented
});

export const endRental = onCall(async (ctx, { rentalId }) => {
  // Transaksjon: sett endTime, frigjør cart
});

export const calculatePrice = onCall(async (ctx, params) => {
  // Returner pris basert på rules + params (isMember, holes, doctorsNote)
});

export const sendReminder = onRequest(async (req, res) => {
  // Finn kommende rentals uten reminderSent, send via SendGrid/Twilio, sett status
});

export const generateReport = onCall(async (ctx, { clubId, range }) => {
  // Hent rentals, generer CSV, last til Storage, lag reports-doc, returnér URL
});

export const provisionClub = onCall(async (ctx, clubData) => {
  // Opprett club, default pricingRules, initial admin-bruker (claims)
});

export const aiAssist = onCall(async (ctx, { clubId, prompt }) => {
  // Hent aggregert kontekst fra Firestore, kall Gemini via serverside key, returner svar
});
```

## Varslinger / integrasjoner

- E-post: SendGrid (transaksjonelle maler). SMS: Twilio.
- Abstraksjon: `notifications.send({ method, to, templateId|body, context })`.
- Feilhåndtering: skriv til `messages` med status=failed, planlagt retry-jobb.

## Admin backoffice (SPA) – modulplan

- Auth + Role gating
- Dashboard (KPI: aktive utleier, biler ledige, estimat)
- Clubs (kun superadmin)
- Carts (liste, status, vedlikehold)
- Rentals (live, sorter/filter, avslutt)
- Pricing (rediger regler)
- Reports (historikk + generering)
- Notifications (logg)
- AI Assistant (serverside proxy)
- Users/Staff (tilordne roller pr klubb)
- Settings (policy, reminder-offset)

## Migrasjon fra eksisterende app

- Engangsskript i admin: importer JSON (fra localStorage-eksport) -> Firestore.
- Mapp felter, sett `migratedFromLegacy: true` for sporbarhet.

## CI/CD (GitHub Actions – skisse)

- Jobber: Lint/Test/Build -> Deploy per miljø-alias.
- Miljøhemmeligheter: Firebase token, SendGrid/Twilio/Gemini keys.
- Deploy-kommandoer:

```pwsh
firebase use dev
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only hosting:admin
```

## Ytelse og kost

- Bruk transaksjoner for create/end rental for færre writes.
- Indekser kun ved behov (se over).
- Rapportgenerering asynkront og cache resultater i Storage.

## Neste steg (backoffice først)

1) Godkjenne denne planen og region/miljøoppsett.
2) Sjekk inn `firebase.json`, `firestore.rules`, minimal `functions/`-skjelett (TypeScript).
3) Implementere `createRental` + `endRental` + regler.
4) Skisser Admin SPA (routing + Auth shell).
5) Pilotere med én klubb (Ski GK), deretter utvide.
