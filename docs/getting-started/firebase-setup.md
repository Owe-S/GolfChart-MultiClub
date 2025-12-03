# Firebase oppsett

Denne guiden viser hvordan du setter opp Firebase-prosjektet for GolfChart.

## Forutsetninger

- Node.js 18+ installert
- Firebase CLI installert globalt
- Tilgang til Firebase-prosjektet

## Installasjon

### 1. Installer Firebase CLI

```pwsh
npm install -g firebase-tools
```

### 2. Logg inn på Firebase

```pwsh
firebase login
```

### 3. Velg prosjekt

```pwsh
# Sjekk tilgjengelige prosjekter
firebase projects:list

# Velg aktivt prosjekt (dev/stage/prod)
firebase use dev
```

## Prosjekter og miljøer

GolfChart bruker tre separate Firebase-prosjekter:

| Miljø | Prosjekt-ID | Formål |
|-------|-------------|---------|
| dev | `golfbilkontroll-skigk-dev` | Lokal utvikling og testing |
| stage | `golfbilkontroll-skigk-stage` | Staging/QA før produksjon |
| prod | `golfbilkontroll-skigk` | Produksjonsmiljø |

### Sette opp aliaser

```pwsh
firebase use --add
# Velg dev-prosjekt, gi alias: dev
# Gjenta for stage og prod
```

## Aktivere Firebase-tjenester

### 1. Firestore Database

```pwsh
# Region: europe-west1 (anbefalt for Norge)
firebase firestore:databases:create (default) --location=europe-west1
```

### 2. Authentication

I Firebase Console:
1. Gå til Authentication > Sign-in method
2. Aktiver "Email/Password"
3. (Valgfritt) Aktiver "Google" for OAuth

### 3. Storage

```pwsh
firebase storage:buckets:create gs://golfbilkontroll-skigk.appspot.com --location=europe-west1
```

### 4. Hosting

Allerede konfigurert i `firebase.json`:

```json
{
  "hosting": {
    "site": "golfbilkontroll-skigk",
    "public": "admin/dist"
  }
}
```

## Konfigurere secrets

Sensitive API-nøkler lagres med Firebase Functions config:

```pwsh
# SendGrid (e-post)
firebase functions:config:set sendgrid.key="SG.xxxxx"

# Twilio (SMS)
firebase functions:config:set twilio.sid="ACxxxxx" twilio.token="xxxxx"

# Gemini AI
firebase functions:config:set ai.gemini_api_key="AIzaSyxxxxx"
```

Sjekk konfigurasjon:

```pwsh
firebase functions:config:get
```

## Deploy første gang

```pwsh
# Bygg admin UI
cd admin
npm run build
cd ..

# Deploy alt
firebase deploy
```

### Delvis deploy

```pwsh
# Kun sikkerhetsregler
firebase deploy --only firestore:rules

# Kun functions
firebase deploy --only functions

# Kun hosting
firebase deploy --only hosting
```

## Lokal emulering

For utvikling uten å påvirke prod-data:

```pwsh
# Start emulatorer
firebase emulators:start

# Med spesifikke tjenester
firebase emulators:start --only firestore,functions,auth
```

Tilgjengelig på:
- Firestore: `localhost:8080`
- Functions: `localhost:5001`
- Auth: `localhost:9099`
- Hosting: `localhost:5000`
- UI: `localhost:4000`

## Verifisering

Test at alt fungerer:

```pwsh
# Sjekk Firestore-regler
firebase firestore:rules:get

# List deployede funksjoner
firebase functions:list

# Sjekk hosting URL
firebase hosting:sites:list
```

## Feilsøking

### Permissions-feil

Sjekk at du har riktige roller i Firebase Console:
- **Owner** eller **Editor** for full tilgang
- **Firebase Admin** for deployment

### Region-problemer

Sørg for konsistent region (`europe-west1`) på tvers av:
- Firestore location
- Functions region (i `functions/src/index.ts`)
- Storage bucket

### Config ikke tilgjengelig i functions

```pwsh
# Hent lokal config for emulator
firebase functions:config:get > functions/.runtimeconfig.json
```

## Neste steg

- [Lokal utvikling](local-dev.md) — Sett opp development-miljø
- [Security Rules](../architecture/security.md) — Forstå sikkerhetsmodellen
- [Cloud Functions](../api/functions.md) — Backend API-dokumentasjon
