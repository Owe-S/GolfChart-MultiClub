# ⛳ GolfChart - Golf Cart Booking & Management System

Welcome to **GolfChart**, a modern golf cart booking and management system built with React, Firebase, and TypeScript.

> **Version 1.0.0** — December 4, 2025

---

## 🎯 Quick Links

| Link | Purpose |
|------|---------|
| 🎮 **[Live User App](https://GolfChart-MultiClub.web.app)** | Player booking interface |
| 📊 **[Live Admin Panel](https://GolfChart-MultiClub.web.app/admin/)** | Administrative dashboard |
| 📖 **[Full Documentation](/)** | Complete docs (you are here) |
| 💻 **[GitHub Repository](https://github.com/Owe-S/GolfChart-MultiClub)** | Source code |

---

## ✨ Features at a Glance

### 🎫 User App
- ✅ **Calendar-based booking** — Easy date selection with month navigation
- ✅ **10-minute time slots** — 54 slots per day (6 per hour)
- ✅ **Real-time availability** — See which carts are available instantly
- ✅ **Player ID tracking** — Format: `073-1234567` for player identification
- ✅ **Auto-calculated duration** — 9h: 2h40m total, 18h: 5h10m total (includes charging)
- ✅ **Smart slot blocking** — Carts automatically unavailable during play + charging

### 📊 Admin Panel
- ✅ **Bookings management** — View all bookings with filtering (all, today, upcoming, past)
- ✅ **Cancellation system** — Cancel bookings with reason tracking
- ✅ **Player statistics** — Track rentals by player ID, holes played, revenue
- ✅ **Cart utilization** — Monitor usage percentage and revenue per cart
- ✅ **Statistics dashboard** — Overview metrics, player tracking, cart performance

---

## 🚀 Getting Started in 2 Minutes

### Development Setup
```bash
# Install dependencies
npm install
cd admin && npm install && cd ..

# Start user app (localhost:5173)
npm run dev

# Start admin app in another terminal (localhost:5174)
cd admin && npm run dev
```

### Deployment
```bash
# Build both apps
npm run build:all

# Deploy to Firebase
firebase deploy --only hosting
```

**Live URLs:**
- User App: https://GolfChart-MultiClub.web.app
- Admin Panel: https://GolfChart-MultiClub.web.app/admin/

---

## 📚 Documentation

### For Users
- **[Features Overview](FEATURES.md)** — All user and admin features explained
- **[Quick Reference Guide](DEVELOPER_GUIDE.md)** — Common tasks and commands

### For Developers
- **[Architecture & Design](ARCHITECTURE.md)** — System overview and data flow
- **[Feature Details](FEATURES.md)** — Deep dive into each feature
- **[Developer Guide](DEVELOPER_GUIDE.md)** — Setup, common tasks, debugging
- **[Changelog](CHANGELOG.md)** — What's new and version history

### For DevOps/Deployment
- **[Getting Started - Local Dev](getting-started/local-dev.md)** — Local development setup
- **[Firebase Setup](getting-started/firebase-setup.md)** — Configure Firebase project

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19.2.0, Vite 7.2.6, TypeScript 5.9.3 |
| **Database** | Firebase Firestore (NoSQL) |
| **Functions** | Cloud Functions (Node.js 20, Gen 2) |
| **Hosting** | Firebase Hosting (europe-west3) |
| **Styling** | CSS3 with responsive design |

---

## 📦 Project Structure

```
GolfChartAppV0.9/
├── src/                          # User app (React)
│   ├── components/
│   │   ├── Calendar.tsx          # Date selection
│   │   ├── AvailabilityGrid.tsx  # 54-slot grid
│   │   └── BookingForm.tsx       # Booking form
│   ├── UserApp.tsx               # Main component
│   └── types.ts                  # TypeScript types
│
├── admin/src/                    # Admin panel (React)
│   ├── pages/
│   │   ├── BookingsListPage.tsx  # Bookings with cancellation
│   │   ├── RentalStatisticsPage.tsx  # Player & cart stats
│   │   └── ...
│   └── App.tsx                   # Admin routing
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System design
│   ├── FEATURES.md               # Feature docs
│   └── ...
│
├── firebase.json                 # Firebase config
├── firestore.rules               # Security rules
├── mkdocs.yml                    # Docs site config
└── README.md                     # Project overview
```

---

## 🔑 Key Concepts

### 10-Minute Time Slots
- **54 slots per day** (10:00-20:50)
- **6 slots per hour** (at :00, :10, :20, :30, :40, :50)
- **Smart blocking** includes play time + charging period

**Example:**
```
10:00 booking (18 holes)
├─ Play: 10:00 → 14:20 (4h 20m)
├─ Charging: 14:20 → 15:10 (50m)
└─ Blocked slots: 10:00-15:10 (next available: 15:20)
```

### Player ID Format
- **Format:** `XXX-XXXXXXX` (3 digits - 7 digits)
- **Examples:** `073-1234567`, `001-0000001`
- **Purpose:** Track players for statistics and repeat customer recognition

### Charging Period
- **9 holes:** 2h 10m play + 30m charging = **2h 40m total**
- **18 holes:** 4h 20m play + 50m charging = **5h 10m total**
- **Effect:** Cart stays blocked until fully charged and ready

---

## 📊 Real-Time Features

- **Live availability grid** — Updates instantly when bookings change
- **Firestore listeners** — Real-time database synchronization
- **Admin dashboard** — Live booking and statistics updates
- **Cancellation sync** — Cancelled rentals immediately free up availability

---

## 🔐 Security

- **Firestore Rules** — Public read, admin write access
- **Player data privacy** — Statistics aggregated (no individual data exposed)
- **Cancellation audit trail** — Reason and timestamp tracked
- **Future: Authentication** — Firebase Auth for user/admin separation

---

## 📈 Recent Updates (v1.0.0)

### Phase 1: Core Booking ✅
- User app with calendar + 54-slot grid
- Player ID validation
- Auto-calculated duration with charging periods
- Real-time availability detection

### Phase 2: Admin Features ✅
- Bookings management with filtering
- Cancellation system with reason tracking
- Player & cart statistics dashboard
- Revenue tracking

### Phase 3: Coming Soon 🔜
- Email notifications (booking/reminder/cancellation)
- Payment integration (Vipps, credit card)
- Player profile management
- Advanced reporting (PDF/CSV export)
- Mobile app

---

## 🐛 Troubleshooting

**"Cart not available but should be?"**
→ Check `chargingEndTime` field and verify cancellations have `status: 'cancelled'`

**"Booking form validation failing?"**
→ Player ID must be `XXX-XXXXXXX` format (e.g., 073-1234567)

**"Functions not deploying?"**
→ Verify Node.js version (need 18+): `node --version`

See [Developer Guide](../DEVELOPER_GUIDE.md#troubleshooting) for more.

---

## 📞 Support & Resources

| Resource | Link |
|----------|------|
| Full README | [README.md](README.md) |
| Feature Details | [FEATURES.md](FEATURES.md) |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Developer Guide | [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| GitHub Issues | https://github.com/Owe-S/GolfChart-MultiClub/issues |

---

## 🎯 Next Steps

1. **Explore the features:** [Features Overview](FEATURES.md)
2. **Understand the design:** [Architecture & Design](ARCHITECTURE.md)
3. **Set up development:** [Developer Guide](DEVELOPER_GUIDE.md)
4. **Deploy to production:** [Hosting Architecture](deployment/hosting-architecture.md)

---

<div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #666;">

**GolfChart v1.0.0** — December 4, 2025

Built with ❤️ for Ski GolfKlubb

[Live App](https://GolfChart-MultiClub.web.app) • [GitHub](https://github.com/Owe-S/GolfChart-MultiClub) • [Docs](/)</div>
