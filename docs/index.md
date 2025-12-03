# GolfChart Dokumentasjon

Velkommen til GolfChart — et moderne, multi-klubb golfbilstyringssystem bygget på Firebase.

## Oversikt

GolfChart lar golfklubber administrere utleie av golfbiler med:

- **Multi-klubb støtte** — Ett system for flere klubber med full dataisolasjon
- **Admin backoffice** — Komplett administrasjonspanel for drift
- **Sanntids oppdateringer** — Firebase Firestore for live status
- **Automatiserte varsler** — E-post og SMS påminnelser
- **AI-assistent** — Gemini-drevet hjelp for personalet
- **Rapportering** — Eksport og analyse av utleiedata

## Rask start

```pwsh
# Installer avhengigheter
npm install

# Start lokal utvikling
cd admin
npm run dev

# Start Firebase emulatorer
firebase emulators:start
```

## Arkitektur

```mermaid
graph TB
    A[Admin SPA] -->|Firebase Auth| B[Cloud Functions]
    A -->|Real-time| C[Firestore]
    B --> C
    B -->|Varsler| D[SendGrid/Twilio]
    B -->|AI| E[Gemini API]
    C -->|Regler| F[Security Rules]
```

## Hovedfunksjoner

### For administratorer
- Dashboard med sanntidsoversikt
- Håndtering av golfbiler (status, vedlikehold)
- Opprett og avslutt utleier
- Prisredigering per klubb
- Rapportgenerering (CSV/JSON)
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

- [Firebase oppsett](getting-started/firebase-setup.md) — Kom i gang med Firebase
- [Lokal utvikling](getting-started/local-dev.md) — Sett opp lokalt miljø
- [Datamodell](architecture/data-model.md) — Forstå databasestrukturen
- [API referanse](api/overview.md) — Cloud Functions dokumentasjon

## Support

For spørsmål og problemer:
- **GitHub Issues:** [github.com/your-org/golfchart/issues](https://github.com/your-org/golfchart/issues)
- **Dokumentasjon:** [golfbilkontroll-skigk.web.app/docs](https://golfbilkontroll-skigk.web.app/docs)

## Lisens

Copyright © 2025 GolfChart Team. Alle rettigheter reservert.
