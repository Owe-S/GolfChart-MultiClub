# Implementation Plan: Progressive Loading Pattern

## Overview
Fix critical UX issue where UI is completely blocked by loading spinners. Implement progressive loading where UI structure renders immediately and data fills in asynchronously.

## Current Problem
```tsx
// ❌ Current pattern - blocks entire UI
if (loading) {
  return <Spinner />; // User sees nothing for 5+ minutes
}
return <FullUI />;
```

## Solution Pattern
```tsx
// ✅ New pattern - UI always visible
return (
  <PageLayout>
    <Header />
    <Content>
      {loading ? <Skeleton /> : <Data />}
    </Content>
  </PageLayout>
);
```

## Implementation Phases

### Phase 1: Create Skeleton/Loading Components
**Timeline:** 1-2 hours
**Files to create:**
- `admin/src/components/SkeletonLoader.tsx` - Generic skeleton
- `admin/src/components/SkeletonCard.tsx` - Card skeleton
- `admin/src/components/SkeletonTable.tsx` - Table skeleton
- `admin/src/components/SkeletonChart.tsx` - Chart skeleton

### Phase 2: Refactor Dashboard Pages
**Timeline:** 3-4 hours
**Files to modify:**
1. **DashboardHome.tsx**
   - Remove `if (loading) return <Spinner />`
   - Render stats cards structure always
   - Show SkeletonCard in each stat while loading
   - Show empty state for active rentals if empty

2. **BookingsListPage.tsx**
   - Render table structure always
   - Show SkeletonTable while loading
   - Show empty state in tbody if no results

3. **CartsPage.tsx**
   - Render grid layout always
   - Show SkeletonCard per slot while loading
   - Show empty state if no carts

### Phase 3: Refactor Report Pages
**Timeline:** 2-3 hours
**Files to modify:**
1. **RevenueReportPage.tsx**
   - Render controls + chart containers always
   - Show SkeletonChart for each chart while loading

2. **BookingAnalyticsPage.tsx**
   - Render heatmap container always
   - Show SkeletonChart while loading

3. **CartPerformancePage.tsx**
   - Render metrics cards always
   - Show SkeletonCard for each metric while loading

### Phase 4: Refactor Booking Pages
**Timeline:** 2-3 hours
**Files to modify:**
1. **BookingPage.tsx**
   - Render calendar + grid always
   - Show loading state inside components only

2. **AvailabilityGrid.tsx**
   - Render grid layout always
   - Show SkeletonCell for each slot while loading

3. **Calendar.tsx**
   - Similar pattern

### Phase 5: Standardize Messages & Error Handling
**Timeline:** 1-2 hours
**Tasks:**
- [ ] Create `EmptyStateCard.tsx` component with standard message
- [ ] Create `ErrorStateCard.tsx` component for inline errors
- [ ] Standardize all empty messages to: "Ingen data for valgt dato. Dette er ikke en feil."
- [ ] Add inline error handlers (not just ErrorBoundary)

## Implementation Checklist

### Step 1: Components
- [ ] Create SkeletonLoader.tsx
- [ ] Create SkeletonCard.tsx
- [ ] Create SkeletonTable.tsx
- [ ] Create SkeletonChart.tsx
- [ ] Create EmptyStateCard.tsx
- [ ] Create ErrorStateCard.tsx

### Step 2: DashboardHome
- [ ] Remove `if (loading) return` block
- [ ] Wrap each stat card in conditional render
- [ ] Use SkeletonCard for stats
- [ ] Use EmptyStateCard for rentals section

### Step 3: BookingsListPage
- [ ] Remove `if (loading) return` block
- [ ] Keep table header always visible
- [ ] Show SkeletonTable rows while loading
- [ ] Use EmptyStateCard in tbody if no results

### Step 4: CartsPage
- [ ] Remove `if (loading) return` block
- [ ] Keep header always visible
- [ ] Show SkeletonCard for each cart while loading
- [ ] Use EmptyStateCard if no carts

### Step 5: RevenueReportPage
- [ ] Keep controls always visible
- [ ] Show SkeletonChart for each chart while loading
- [ ] Use EmptyStateCard if no data

### Step 6: BookingAnalyticsPage
- [ ] Keep controls always visible
- [ ] Show SkeletonChart while loading
- [ ] Use EmptyStateCard if no data

### Step 7: CartPerformancePage
- [ ] Keep controls always visible
- [ ] Show SkeletonCard for metrics while loading
- [ ] Use EmptyStateCard if no data

### Step 8: BookingPage + Subcomponents
- [ ] AvailabilityGrid: Keep layout, show SkeletonCell while loading
- [ ] Calendar: Keep structure, show SkeletonDay while loading
- [ ] Step components: Render forms always, show SkeletonInput while loading

### Step 9: Quality Assurance
- [ ] Test each page loads UI immediately
- [ ] Verify no full-page spinners
- [ ] Test empty states display correctly
- [ ] Test error states display inline
- [ ] Mobile responsiveness verified
- [ ] Performance: Skeleton rendering is instant

## CSS Requirements

All skeleton components need CSS animations:
```css
@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.skeleton {
  animation: skeleton-pulse 2s infinite;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}
```

## Rollout Strategy

1. **Commit 1:** Create skeleton components
2. **Commit 2:** Refactor DashboardHome
3. **Commit 3:** Refactor BookingsListPage + CartsPage
4. **Commit 4:** Refactor Report pages
5. **Commit 5:** Refactor Booking pages
6. **Commit 6:** Standardize messages & error handling
7. **Final:** Deploy and test in production

## Testing Checklist

- [ ] DashboardHome loads immediately with skeletons
- [ ] BookingsListPage renders table with skeleton rows
- [ ] CartsPage renders grid with skeleton cards
- [ ] RevenueReportPage shows skeleton charts
- [ ] BookingAnalyticsPage shows skeleton heatmap
- [ ] CartPerformancePage shows skeleton metrics
- [ ] BookingPage calendar + grid visible immediately
- [ ] Empty states show with correct message
- [ ] Error states show inline without blocking UI
- [ ] Mobile: All pages responsive
- [ ] Performance: No lag on skeleton rendering

## Timeline
**Total: 10-15 hours of implementation**
- Phase 1: 1-2h
- Phase 2: 3-4h
- Phase 3: 2-3h
- Phase 4: 2-3h
- Phase 5: 1-2h
- Testing: 1h

## Priority
**CRITICAL** - Currently breaking user experience completely
