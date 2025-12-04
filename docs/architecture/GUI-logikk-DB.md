GUI-logikk-DB.md (full spesifikasjon)

GUI-logikk vs. Database-logikk

**KRITISK PRINSIPP: UI-struktur skal ALDRI blokkeres av data-lasting**

Retningslinjer for stabil UI-rendering uavhengig av datainnhold

Formål:

Sikre at brukere ALLTID ser en komplett GUI-struktur UMIDDELBART når de navigerer, selv mens data laster. UI skal aldri vise kun en spinner. Et tomt datasett skal behandles som en gyldig tilstand, ikke som en feil som hindrer rendering av UI.

Bakgrunn:

Brukere forventer at siden laster umiddelbart med layout, navigasjon og struktur - deretter fylles data inn. I dagens logikk blokkeres HELE UI av `if (loading)` som gjør at siden viser KUN spinner i 5+ minutter. Dette bryter brukeropplevelsen helt. Løsningen er "progressive loading":
- Render UI-struktur STRAKS (layout, headers, sidebar, knapper)
- Vis skeleton/placeholder for data-områder
- Fyll data inn etterhvert som den ankommer

Krav til systemdesign:



1. UI-struktur skal ALLTID rendres UMIDDELBART - IKKE blokkert av loading

FEIL MØNSTER (blokkerer UI):
```tsx
if (loading) {
  return <div>Laster...</div>; // ❌ HELE siden forsvinner
}
return <div>{/* full UI */}</div>;
```

RIKTIG MØNSTER (progressive loading):
```tsx
return (
  <div>
    {/* Layout, header, sidebar - ALLTID synlig */}
    <div className="page-header">
      <h1>Dashboard</h1>
    </div>
    
    <div className="content-area">
      {/* Data-områder viser skeleton/placeholder mens loading */}
      {loading ? (
        <SkeletonLoader /> // Viser form/struktur, ikke tekst
      ) : (
        <DataContent data={rentals} /> // Data fylles inn
      )}
    </div>
  </div>
);
```

2. Data-områder skal vise skeleton/placeholder - IKKE bare spinner

- Skeleton skal ha SAMME layout som endelig innhold
- Bruker ser hvor data kommer
- Opplevelse: "data laster inn" ikke "siden laster"

3. Tre tilstander skal håndteres INNENFOR UI, ikke blokkere den

a) **Loading-state**: Skeleton/placeholder i data-områder
b) **Error-state**: Feilmelding inline (ikke blokkering)
c) **Empty-state**: Informativ melding: "Ingen data funnet for valgt dato. Dette er ikke en feil."

4. Datamodellen må støtte tomt resultat



UI skal implementere tre tydelige tilstander

a) Loading-state: Vis spinner eller skeleton.

b) Error-state: Vis feilmelding ved tekniske feil (nettverk, timeout, 500-feil).

c) Empty-state: Aktiveres når API svarer tomt datasett. Vis informasjonsboks:

“Ingen data funnet for valgt dato. Dette er ikke en feil.”



Prinsipp for utviklere

Prinsipp for utviklere

**HOVEDDOKTRIN: Render først, så last data. Aldri blokkér UI på data.**

UI skal være stabil og alltid synlig. Data kan være tomt, laster eller har feil. Hver tilstand håndteres innenfor UI-strukturen, aldri ved å gjemme siden.

Spesifikke regler:

- ❌ ALDRI: `if (loading) return <Spinner />`
- ✅ JA: Render layout + skeletons innenfor
- ❌ ALDRI: Null eller exception fra API når 0 rows
- ✅ JA: Returnér `[]` og håndtér i UI
- ❌ ALDRI: Skjul hele siden mens data laster
- ✅ JA: Vis struktur med placeholder-data



Standardtekster for tomt datasett



Ingen registrerte hendelser for valgt dato.



Ingen data funnet. Dette er ikke en feil.



Ingen bookinger for valgt filtrering.



Prøv en annen dato eller juster filteret.



Konsekvens for videre utvikling



Backend skal aldri kaste feil ved 0 rows.



Frontend skal aldri la rendering avhenge av data-mengde.



Komponenter skal ha definerte tilstander for empty/loading/error.



Dokumentasjonen skal inkluderes i prosjektets arkitektur.



Ansvar og versjonskontroll

Denne filen skal lagres i docs/architecture eller docs/guidelines og oppdateres når nye moduler bygges.

Sist oppdatert: 2025-12-04
Ansvarlig: Owe Stangeland / GKIT
Status: CRITICAL - Gjeldende implementering bryter disse reglene




GUI-logikk-DB-kommentarer.md (punkt 1–8)



GUI-logikk vs DB – Kommentarer punkt 1–8



Brukerens logikk:

Brukeren forventer at appen viser hele UI-et uansett, og at mangel på data kun vises som en tom-tilstand.



Utvikler-/database-logikk:

Typisk logikk stopper rendering hvis databasen returnerer null eller 0 rader.



Hovedproblem:

Når det ikke finnes data for valgt dato, vises ingenting eller appen feiler.



Krav:

UI skal rendres uansett. “Ingen data” er ikke en feiltilstand.



Løsning:

API og datalag skal returnere tomme objekter/lister i stedet for null eller exception.



UI-tilstander:

Appen må støtte loading, error og empty som tre separate tilstander.



Kommunikasjon til utviklere:

Forklar at tomt datasett er en helt normal state og ikke skal stoppe rendering.



Konsekvens:

Konsekvens for videre utvikling

1. Alle sider må refaktoreres fra `if (loading) return spinner` til progressive loading
2. Skeletonscreens må implementeres for alle data-områder
3. Loading/Error/Empty states må håndteres INNENFOR layout, ikke blokkere det
4. API skal ALDRI returnere null - returnér `{ items: [], count: 0 }`
5. Inline error-handling for API-feil (ikke bare ErrorBoundary)
6. Standardiserte meldinger for empty-state

IMPLEMENTERINGS-SJEKKLISTE:

- [ ] DashboardHome: Refaktor loading pattern, add skeletons for stats cards
- [ ] BookingsListPage: Add skeleton table while loading
- [ ] CartsPage: Add skeleton grid while loading
- [ ] RevenueReportPage: Add skeleton charts while loading
- [ ] BookingAnalyticsPage: Add skeleton heatmap while loading
- [ ] CartPerformancePage: Add skeleton metrics while loading
- [ ] BookingPage: Render calendar + grid immediately, load data into it
- [ ] Alle Step-komponenter: Render form structure immediately
- [ ] Add SkeletonLoader.tsx component for consistent placeholders
- [ ] Standardize empty-state messages across all pages
- [ ] Add error-state inline (not just boundary)

