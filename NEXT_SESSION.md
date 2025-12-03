# Neste økt – Quick Resume

Dato: 2025-11-17

## Hva er viktigst å huske

- Admin/backoffice først på Firebase (Hosting, Firestore, Functions, Auth). Public UI beholdes foreløpig.
- Region: `europe-west1`. Miljøer: `dev`, `stage`, `prod`.
- Multi-klubb via `clubId` + custom claims (`roles`, `clubIds`).

## Sjekkliste før vi begynner

1. Firebase CLI og innlogging

```pwsh
npm i -g firebase-tools
firebase login
```


2. Velg dev-miljø (alias)

```pwsh
firebase use dev
```


3. (Hvis ikke gjort) Initialiser i repoet – velg Firestore, Functions, Hosting, Storage

```pwsh
firebase init
```


4. Sett secrets for integrasjoner (lagres i Firebase, ikke i repo)

```pwsh
firebase functions:config:set sendgrid.key="<SENDGRID_API_KEY>"
firebase functions:config:set twilio.sid="<TWILIO_SID>" twilio.token="<TWILIO_TOKEN>"
firebase functions:config:set ai.gemini_api_key="<GEMINI_API_KEY>"
```

## Neste handlinger (konkret)

- Sjekk inn `firestore.rules` basert på skjelettet i `Firebase_plan.md`.
- Generer Functions-skjelett (TypeScript): `createRental`, `endRental`, `calculatePrice`.
- Legg til minimal Admin SPA (React/Vite) shell (+ Auth gating).
- Opprett Firestore-indekser: rentals (clubId+startTime), carts (clubId+status), maintenanceLogs (cartId+timestamp).

## Beslutninger vi allerede har tatt

- Hybrid strategi (Admin først på Firebase, public senere).
- europe-west1 for alle tjenester.
- Roller: `superadmin`, `clubAdmin`, `staff`, `viewer` via custom claims.

## Lenker i repoet

- Plan og detaljer: `Firebase_plan.md`
- Denne sjekklisten: `NEXT_SESSION.md`
