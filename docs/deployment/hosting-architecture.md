# Deployment & Architecture

## Hosting Configuration (December 2025)

### Current Setup

The GolfChart application is deployed as a **dual-app** structure on Firebase Hosting:

| App | URL | Directory | Purpose |
|-----|-----|-----------|---------|
| **User App** | https://GolfChart-MultiClub.web.app/ | `/public/` | Public booking interface for end users |
| **Admin Dashboard** | https://GolfChart-MultiClub.web.app/admin/ | `/public/admin/` | Administrative panel for staff |

### Firebase Hosting Configuration

The `firebase.json` file controls the routing:

```json
{
  "hosting": [
    {
      "site": "GolfChart-MultiClub",
      "public": "public",
      "rewrites": [
        {
          "source": "/admin/**",
          "destination": "/admin/index.html"
        },
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

**How it works:**
1. Requests to `/admin/**` → Served from `/public/admin/index.html` (Admin SPA)
2. All other requests → Served from `/public/index.html` (User SPA)
3. Both are single-page applications (SPA) that handle their own routing

### Build Process

#### User App
- **Source:** Root level (`package.json`, `/public/` static files)
- **Built by:** Standard web app tooling
- **Output:** `/public/index.html` + assets

#### Admin Dashboard
- **Source:** `/admin/` folder (React + Vite + TypeScript)
- **Build command:** `cd admin && npm run build`
- **Vite config:** `base: '/admin/'` (ensures correct asset paths)
- **Output:** `/admin/dist/` → copied to `/public/admin/`
- **Deploy:** Included in Firebase hosting deployment

### Deployment Steps

1. **Build Admin Dashboard:**
   ```pwsh
   cd admin
   npm run build
   ```

2. **Copy Admin Build:**
   ```pwsh
   Copy-Item -Path "admin/dist/*" -Destination "public/admin/" -Recurse -Force
   ```

3. **Deploy to Firebase:**
   ```pwsh
   firebase deploy --only hosting
   ```

### URL Routing

- `/` → User booking interface
- `/admin/` → Admin dashboard
- `/admin/dashboard` → Admin dashboard (React Router)
- `/admin/booking` → Ny Booking page
- `/admin/bookings` → Bookinger page
- `/admin/carts` → Golfbiler page
- `/admin/reports` → Rapporter hub
- `/admin/reports/revenue` → Revenue report
- `/admin/reports/analytics` → Booking analytics
- `/admin/reports/performance` → Cart performance

### Asset Paths

All admin assets are served from `/admin/assets/`:
- JavaScript: `/admin/assets/*.js`
- CSS: `/admin/assets/*.css`
- Images: `/admin/assets/images/*`

The admin app's `vite.config.ts` specifies `base: '/admin/'` to ensure Vite bundles all asset references with the correct paths.

### Development

**User App:** Standard local development (see `local-dev.md`)

**Admin App:**
```pwsh
cd admin
npm run dev
```
Runs on `http://localhost:5173` locally, builds to `/admin/` for production.

### Troubleshooting

#### Admin app shows blank page
- Check `/admin/index.html` exists
- Verify `/admin/assets/` contains JS and CSS files
- Check browser console for 404 errors on `/admin/assets/*`

#### Assets 404 errors
- Ensure `vite.config.ts` has `base: '/admin/'`
- Verify admin build was copied to `public/admin/`
- Check asset filenames match in `index.html`

#### User app not loading at root
- Verify `public/index.html` exists
- Check `firebase.json` rewrite rule for root path
- Ensure `/public/` is set as hosting public directory

### Security

- Both apps use Firebase Authentication
- Firestore security rules restrict access by role
- Admin app requires authentication
- User app requires authentication for bookings
- Cloud Functions validate all requests
