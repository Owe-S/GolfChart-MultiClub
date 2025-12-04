# Golf Chart - Complete Booking System

## 🎯 Live URLs

- **Player Booking App**: https://GolfChart-MultiClub.web.app
- **Admin Dashboard**: https://GolfChart-MultiClub.web.app/admin/

## 🏗️ Project Structure

```
├── src/                    # User app (root `/`)
│   ├── UserApp.tsx
│   ├── components/
│   │   ├── Calendar.tsx
│   │   ├── AvailabilityGrid.tsx
│   │   └── BookingForm.tsx
│   ├── firebase.ts
│   ├── types.ts
│   ├── main.tsx
│   └── user-theme.css
│
├── admin/                  # Admin app (path `/admin/`)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── BookingsListPage.tsx
│   │   │   ├── CartsPage.tsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── SkeletonTable.tsx
│   │   │   └── ...
│   │   ├── firebase.ts
│   │   └── ski-gk-theme.css
│   └── vite.config.ts
│
├── public/                 # Deployed apps
│   ├── index.html         # User app entry
│   ├── assets/            # User app JS/CSS
│   ├── admin/             # Admin app folder
│   │   ├── index.html
│   │   └── assets/
│
├── vite.config.ts         # User app build config
├── tsconfig*.json         # TypeScript configs
├── package.json           # Root dependencies
└── firebase.json          # Firebase hosting config
```

## 📦 What's Included

### User App (`/`)
- 📅 Calendar for date selection
- 🟢 Availability grid (5 carts × 11 time slots)
- 📋 Booking form with auto-calculated end times
- 💾 Direct Firestore integration
- 📱 Responsive mobile/tablet/desktop

### Admin App (`/admin/`)
- 📊 Dashboard with stats
- 📝 Bookings list management
- 🚗 Cart inventory management
- 📈 Reports and analytics
- 🔄 Progressive loading with skeletons

## 🚀 Quick Start

### Build
```bash
# Install dependencies (first time only)
npm install
cd admin
npm install
cd ..

# Build both apps
npm run build:all

# Or build individually:
npm run build              # User app only
cd admin && npm run build  # Admin app only
```

### Deploy
```bash
firebase deploy --only hosting
```

### Development
```bash
# Terminal 1: User app
npm run dev

# Terminal 2: Admin app
cd admin
npm run dev
```

## 💾 Database Schema

### carts collection
```json
{
  "id": 1,
  "name": "Blå 4",
  "status": "available"
}
```

### rentals collection
```json
{
  "cartId": 1,
  "renterName": "John Doe",
  "membershipNumber": "73-10524",
  "isMember": true,
  "holes": 18,
  "startTime": "2025-12-04T10:00:00.000Z",
  "endTime": "2025-12-04T14:00:00.000Z",
  "phone": "98765432",
  "email": "john@example.no",
  "notes": "Customer request",
  "price": 450,
  "status": "pending",
  "createdAt": "timestamp"
}
```

## 🎨 Design Features

- **Progressive Loading**: UI renders immediately, data loads async
- **Responsive**: Mobile-first responsive design
- **Color Scheme**: Blue (#003d82), Yellow (#FFD700), Green (#2ecc71)
- **Skeleton Screens**: Loading states with pulse animations
- **Accessibility**: High contrast, keyboard navigation support

## 🔐 Firebase Configuration

- Project: `golfbilkontroll-skigk`
- Region: `europe-west3`
- Hosting: `GolfChart-MultiClub.web.app`

### Firestore Rules
Current setup allows public read/write. Consider:
- Adding authentication for user app
- Restricting admin dashboard to authenticated admins
- Implementing proper authorization rules

## 📈 Tech Stack

- **Frontend**: React 19.2.0, TypeScript 5.9.3, Vite 7.2.6
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Styling**: CSS with responsive design
- **Routing**: React Router v7 (admin app)
- **Build**: Vite with React plugin

## ✅ Features Implemented

### User App
- ✅ Calendar date selection
- ✅ Real-time availability checking
- ✅ Booking form with validation
- ✅ Automatic end-time calculation
- ✅ Firestore integration
- ✅ Success/error notifications
- ✅ Responsive design

### Admin App
- ✅ Dashboard with stats
- ✅ Bookings management
- ✅ Cart inventory
- ✅ Progressive loading
- ✅ Skeleton loaders
- ✅ Error handling
- ✅ Reports (if needed)

## 🔧 Customization

### Colors
Edit `src/user-theme.css` and `admin/src/ski-gk-theme.css`:
```css
--primary-blue: #003d82;
--primary-yellow: #FFD700;
--primary-green: #2ecc71;
```

### Time Slots
Edit `src/components/AvailabilityGrid.tsx` TIME_SLOTS array

### Cart Names
Update Firestore `carts` collection documents

### Pricing
Edit `src/components/BookingForm.tsx` price calculation

## 📞 Support

For issues or feature requests, check:
1. Firebase console logs
2. Browser console errors
3. Firestore data integrity
4. Network connectivity

---

**Last Updated**: December 4, 2025  
**Status**: ✅ Production Ready  
**Version**: 0.9.0
