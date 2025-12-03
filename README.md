# GolfChart App – Environment and Deploy Status

- Node (local): v22.17.0; npm: 10.9.2; Firebase CLI: 14.26.0
- Admin: Vite 7.2.6, TypeScript 5.9; builds to `admin/dist`
- Functions: Node 20 (1st Gen), firebase-functions 4.9.0 (upgrade planned)
- Emulators: Config added in `firebase.json` (functions:5001, firestore:8080, ui:4000). CLI init required to start.

## Function URLs
- `checkAvailability` (eu-west1): https://europe-west1-golfbilkontroll-skigk.cloudfunctions.net/checkAvailability
- `createRental` (eu-west1): https://europe-west1-golfbilkontroll-skigk.cloudfunctions.net/createRental

## Notes
- Admin `package.json` pins `engines.node >=18` for clarity.
- `firebase.json` includes emulator config and hosting sites.
- To avoid accidental deletions, answer `N` when deploy prompts to delete functions not present locally.
