# GolfChart Dokumentasjon

Velkommen til GolfChart — et moderne, multi-klubb golfbilstyringssystem bygget på Firebase.

## URLs

| Application | URL |
|-------------|-----|
| **User App** | https://GolfChart-MultiClub.web.app |
| **Admin Dashboard** | https://GolfChart-MultiClub.web.app/admin/ |
| **Documentation** | https://golfbilkontroll-skigk.web.app/docs |

## Oversikt

GolfChart lar golfklubber administrere utleie av golfbiler med:

- **Multi-klubb støtte** — Ett system for flere klubber med full dataisolasjon
- **Admin backoffice** — Komplett administrasjonspanel for drift
- **Sanntids oppdateringer** — Firebase Firestore for live status
- **Automatiserte varsler** — E-post og SMS påminnelser
- **AI-assistent** — Gemini-drevet hjelp for personalet
- **Rapportering** — Eksport og analyse av utleiedata

## Rask start

` pwsh
# Installer avhengigheter
npm install

# Start lokal utvikling (User App)
npm run dev

# Start Admin Dashboard (lokal)
cd admin
npm run dev

# Start Firebase emulatorer
firebase emulators:start
` 

## Deployment

- **User App:** Served at / (public folder)
- **Admin Dashboard:** Served at /admin/ (public/admin folder)
- Se [Hosting Architecture](deployment/hosting-architecture.md) for detaljert setup

## Hovedfunksjoner

### For administratorer

- Dashboard med sanntidsoversikt
- Håndtering av golfbiler (status, vedlikehold)
- Opprett og avslutt utleier
- Prisredigering per klubb
- Rapportgenerering (CSV/PDF)
- Bruker- og rollestyring

### For ansatte

- Registrer nye utleier
- Avslutt pågående utleier
- Sett biler ute av drift
- Se utleiehistorikk
- AI-assistent for spørsmål

### For teknisk drift

- Multi-miljø (dev, stage, prod)
- CI/CD med GitHub Actions
- Strukturert logging
- Sikker nøkkelhåndtering
- Automatisk backup

## Neste steg

- [Hosting & Architecture](deployment/hosting-architecture.md) — Forstå deployment setup
- [Firebase oppsett](getting-started/firebase-setup.md) — Kom i gang med Firebase
- [Lokal utvikling](getting-started/local-dev.md) — Sett opp lokalt miljø

## Support

For spørsmål og problemer, se dokumentasjonen ovenfor.

Copyright © 2025 GolfChart Team. Alle rettigheter reservert.
