# GolfChart App – Environment and Deploy Status

- Node (local): v22.17.0; npm: 10.9.2; Firebase CLI: 14.26.0
- Admin: Vite 7.2.6, TypeScript 5.9; builds to `admin/dist`
- Functions: Node 20 (2nd Gen), firebase-functions 4.9.0, deployed to **europe-west3**
- Emulators: Config added in `firebase.json` (functions:5001, firestore:8080, ui:4000). CLI init required to start.

## Function URLs (europe-west3)

- `checkAvailability`: https://europe-west3-golfbilkontroll-skigk.cloudfunctions.net/checkAvailability
- `createRental`: https://europe-west3-golfbilkontroll-skigk.cloudfunctions.net/createRental

## Migration History

**Region Migration Completed** (Dec 4, 2025)

- ✅ Migrated from europe-west1 to europe-west3
- ✅ Upgraded from Cloud Functions Gen 1 to Gen 2
- ✅ Updated admin app configuration
- ✅ Admin deployed to https://GolfChart-MultiClub.web.app

## Region Migration Plan (Template for Future Migrations)

**Current State:**

- Active functions in **europe-west1** (new deployment)
- Preserved functions in **europe-west3** (original deployment)
- Admin app configured to call europe-west1 endpoints

**Migration Strategy (Zero-Downtime Dual Deploy):**

1. **Deploy to Target Region (europe-west3)**
   - Run: `firebase deploy --only functions`
   - When prompted about deletions, answer `N` to preserve europe-west1
   - Verify new europe-west3 function URLs are accessible

2. **Update Admin Configuration**
   - Edit `admin/src/firebase.ts`: Change `getFunctions(app, 'europe-west1')` → `'europe-west3'`
   - Edit `admin/src/firebaseService.ts`: Change both `region = 'europe-west1'` → `'europe-west3'`
   - Rebuild: `cd admin && npm run build`

3. **Deploy Updated Admin**
   - Run: `firebase deploy --only hosting`
   - Verify hosting URL uses new europe-west3 endpoints

4. **Smoke Test & Monitor**
   - Test booking flow end-to-end on live site
   - Monitor Cloud Functions logs for errors: `firebase functions:log`
   - Verify correct region in logs

5. **Clean Up Old Region (After Verification)**
   - Delete europe-west1 functions via Firebase Console or CLI
   - Confirm cost reduction in billing dashboard

**Rollback Plan:**

- Keep europe-west1 functions live until migration fully verified
- If issues arise, revert admin config to europe-west1, rebuild, redeploy
- Original endpoints remain functional during entire migration

## Notes

- Admin `package.json` pins `engines.node >=18` for clarity.
- `firebase.json` includes emulator config and hosting sites.
- To avoid accidental deletions, answer `N` when deploy prompts to delete functions not present locally.
- Current hosting: https://GolfChart-MultiClub.web.app
