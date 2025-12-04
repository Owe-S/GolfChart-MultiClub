# GolfChart UI/UX Implementation Task List

**Date Created:** December 4, 2025  
**Status:** In Planning  
**Reference:** UI_UX_IMPROVEMENT_ROADMAP.md

---

## Phase 1: Enhanced Booking Flow (Week 1-2)

### 1.1 Fix Firestore Composite Index (BLOCKER - Must do first)

- [ ] Task 1.1.1: Create firestore.indexes.json with rentals index
  - Collection: `rentals`
  - Fields: `cartId` (ASCENDING), `startTime` (ASCENDING)
  - Deploy: `firebase deploy --only firestore:indexes`

- [ ] Task 1.1.2: Test createRental function after index creation
  - Verify booking creation works
  - Check function logs for errors

### 1.2 Enhanced Step Indicator Component

- [ ] Task 1.2.1: Create `ProgressSteps.tsx` improvements
  - Add step icons (numbered 1-4)
  - Add progress percentage
  - Make steps clickable to go back
  - Add status indicators

- [ ] Task 1.2.2: Update `BookingStepper.tsx`
  - Integrate new progress component
  - Wire up step navigation (back/forward)
  - Update styling

- [ ] Task 1.2.3: Test step indicator
  - Verify all 4 steps display correctly
  - Test back navigation
  - Check progress updates

### 1.3 Restructure Booking Flow (New 4-Step Design)

#### Step 1: When & How Long (Date + Time + Duration)

- [ ] Task 1.3.1: Create `Step1When.tsx` component
  - Enhanced calendar with availability heatmap
  - Time slot selector with visual timeline
  - 9/18 hole selector with live price preview
  - "Next available" quick suggestion button

- [ ] Task 1.3.2: Update calendar styling
  - Add color coding for availability
  - Add tooltips on hover
  - Make responsive for mobile

- [ ] Task 1.3.3: Create time slot selector UI
  - Show available time blocks
  - Display duration options (9/18 holes)
  - Show price for each option

#### Step 2: Choose Your Cart (Cart Selection)

- [ ] Task 1.3.4: Create `Step2CartSelection.tsx` component
  - Visual cart cards with status badges
  - Real-time status (Available, Charging, In Use)
  - Cart features/condition indicators
  - Filter toggle (All/Available only)

- [ ] Task 1.3.5: Design cart cards
  - Add cart photos/icons
  - Status badges with colors
  - Features list
  - Click to select

- [ ] Task 1.3.6: Test cart selection flow
  - Verify cart loading
  - Test filtering
  - Check real-time status updates

#### Step 3: Your Details (Customer Information)

- [ ] Task 1.3.7: Enhance `Step3Details.tsx`
  - Member/Non-member toggle with instant price update
  - Contact preference chips (Email/SMS)
  - Doctor's note checkbox with discount indicator
  - Form validation with inline error messages

- [ ] Task 1.3.8: Add price calculation updates
  - Show base price
  - Show discounts dynamically
  - Update total on toggle changes

- [ ] Task 1.3.9: Improve form validation
  - Real-time field validation
  - Clear error messages
  - Highlight invalid fields

#### Step 4: Review & Confirm (Summary)

- [ ] Task 1.3.10: Enhance `Step4Review.tsx`
  - Show complete booking summary card
  - Price breakdown (base + discounts)
  - Add "Edit" buttons for each section
  - Add terms acceptance checkbox
  - Confirm button with loading state

- [ ] Task 1.3.11: Add edit functionality
  - Allow editing date/time from review
  - Allow editing cart from review
  - Allow editing details from review

- [ ] Task 1.3.12: Test complete booking flow
  - Full end-to-end booking
  - Verify confirmation creates rental
  - Check success/error states

---

## Phase 2: Admin Dashboard (Week 3-4)

### 2.1 Create Admin Layout Structure

- [ ] Task 2.1.1: Create `AdminLayout.tsx` component
  - Sidebar navigation
  - Top header bar
  - Main content area
  - Mobile bottom navigation

- [ ] Task 2.1.2: Implement sidebar menu
  - Dashboard link
  - Bookings link
  - Carts link
  - Reports link
  - Members link (future)

- [ ] Task 2.1.3: Create responsive navigation
  - Desktop sidebar (always visible)
  - Mobile hamburger menu
  - Bottom nav for mobile

### 2.2 Dashboard Home Screen

- [ ] Task 2.2.1: Create `DashboardHome.tsx` component
  - Today's stats section
  - Active rentals card
  - Quick actions panel

- [ ] Task 2.2.2: Build stats cards
  - Active Rentals count
  - Completed Today count
  - Revenue Today amount
  - Next Booking time

- [ ] Task 2.2.3: Create real-time booking cards
  - Display active rentals
  - Show cart and renter info
  - Display time remaining
  - Status color coding

- [ ] Task 2.2.4: Add quick action buttons
  - "New Booking" button
  - "View Reports" button
  - "Manage Carts" button
  - "View Members" button

- [ ] Task 2.2.5: Connect to Firestore for real-time data
  - Query active rentals
  - Calculate stats
  - Set up real-time listeners

### 2.3 Enhanced Availability Grid for Admin

- [ ] Task 2.3.1: Upgrade `AvailabilityGrid.tsx`
  - Add hover tooltips with booking details
  - Show renter name on hover
  - Show contact info on hover

- [ ] Task 2.3.2: Add drag-to-select feature
  - Multi-time slot selection
  - Quick multi-slot booking

- [ ] Task 2.3.3: Support multi-cart booking
  - Select multiple carts at once
  - Create batch bookings

- [ ] Task 2.3.4: Add export to calendar
  - Export selected booking as iCal
  - Add to Google/Outlook calendar link

---

## Phase 3: Reports & Analytics UI (Week 5-6)

### 3.1 Revenue Reports Page

- [ ] Task 3.1.1: Create `RevenueReport.tsx` component
  - Date range picker (date-fns)
  - Member vs Non-member toggle
  - Export to CSV button

- [ ] Task 3.1.2: Build revenue chart
  - Daily revenue chart (Recharts)
  - Weekly revenue chart
  - Monthly revenue chart
  - Add hover details

- [ ] Task 3.1.3: Add revenue metrics
  - Total revenue for period
  - Average per day
  - Member revenue %
  - Non-member revenue %

- [ ] Task 3.1.4: Create discount analysis table
  - Show discounts applied
  - Discount amount totals
  - Discount effectiveness

### 3.2 Booking Analytics Page

- [ ] Task 3.2.1: Create `BookingAnalytics.tsx` component
  - Most popular time slots chart
  - Booking duration distribution
  - Cancellation patterns
  - Wait time analysis

- [ ] Task 3.2.2: Build time slot heatmap
  - Show peak booking hours
  - Color intensity = booking frequency
  - Interactive day/week/month view

- [ ] Task 3.2.3: Add booking metrics
  - Total bookings count
  - Cancellation rate
  - Completion rate
  - Average duration

### 3.3 Cart Performance Page

- [ ] Task 3.3.1: Create `CartPerformance.tsx` component
  - Cart utilization table
  - Usage hours per cart
  - Maintenance schedule tracker
  - Downtime analysis

- [ ] Task 3.3.2: Build cart stats
  - Hours used per cart
  - Revenue per cart
  - Utilization %
  - Status indicator

- [ ] Task 3.3.3: Add maintenance tracking
  - Scheduled maintenance dates
  - Downtime reasons
  - Repair costs
  - Charge cycle optimization

### 3.4 Export & Scheduling

- [ ] Task 3.4.1: Add export functionality
  - Export reports to CSV
  - Export reports to PDF
  - Email report link

- [ ] Task 3.4.2: Schedule recurring reports
  - Daily reports email
  - Weekly reports email
  - Monthly reports email
  - Custom schedule option

---

## Phase 4: Mobile Responsiveness (Week 7-8)

### 4.1 Responsive Layout

- [ ] Task 4.1.1: Test all pages on mobile
  - Calendar view on mobile
  - Availability grid on mobile
  - Forms on mobile
  - Dashboard on mobile

- [ ] Task 4.1.2: Implement bottom navigation bar
  - Mobile nav bar for admin
  - Icon-based navigation
  - Active state indicator

- [ ] Task 4.1.3: Optimize booking flow for mobile
  - Swipeable steps (react-swipeable)
  - Vertical layout
  - Touch-friendly buttons

- [ ] Task 4.1.4: Optimize forms for mobile
  - Full-width inputs
  - Larger touch targets
  - Keyboard-friendly layouts

### 4.2 Collapsible Components

- [ ] Task 4.2.1: Make availability grid collapsible
  - Collapse to date picker only
  - Expand to full grid on demand
  - Save state to localStorage

- [ ] Task 4.2.2: Responsive sidebar
  - Hide on mobile (hamburger only)
  - Show on tablet/desktop
  - Smooth transitions

### 4.3 Mobile-Specific Features

- [ ] Task 4.3.1: Implement swipe gestures
  - Swipe between booking steps
  - Swipe to delete on lists
  - Swipe to refresh

- [ ] Task 4.3.2: Touch-optimized calendar
  - Larger tap targets
  - Touch scrolling
  - Zoom support

---

## Phase 5: User Experience Enhancements (Week 9-10)

### 5.1 Loading States

- [ ] Task 5.1.1: Add skeleton screens
  - Skeleton for dashboard cards
  - Skeleton for booking steps
  - Skeleton for reports

- [ ] Task 5.1.2: Implement progressive loading
  - Load availability grid progressively
  - Load carts progressively
  - Load reports progressively

- [ ] Task 5.1.3: Add optimistic UI updates
  - Show booking immediately
  - Show cart status change immediately
  - Rollback on error

### 5.2 Error Handling

- [ ] Task 5.2.1: Implement inline validation
  - Real-time field validation
  - Error messages below fields
  - Red error highlighting

- [ ] Task 5.2.2: Add retry mechanisms
  - Retry failed bookings
  - Retry failed API calls
  - Show retry button

- [ ] Task 5.2.3: Handle offline mode
  - Detect offline
  - Queue bookings for sync
  - Show offline indicator

- [ ] Task 5.2.4: Conflict resolution
  - Handle double-booking
  - Show conflict details
  - Suggest alternative times

### 5.3 Notifications

- [ ] Task 5.3.1: Implement toast notifications
  - Success toast (react-hot-toast)
  - Error toast
  - Info toast
  - Dismiss after 3 seconds

- [ ] Task 5.3.2: Add booking confirmation modal
  - Show booking summary
  - Confirm before create
  - Show confirmation number

- [ ] Task 5.3.3: Email/SMS preview
  - Preview booking email
  - Preview reminder SMS
  - Edit before sending

- [ ] Task 5.3.4: Reminder management
  - Set reminder time
  - Choose reminder method
  - View scheduled reminders

### 5.4 Accessibility

- [ ] Task 5.4.1: Keyboard navigation
  - Tab through all elements
  - Enter to submit forms
  - Escape to close modals
  - Arrow keys in dropdowns

- [ ] Task 5.4.2: Screen reader support
  - Add ARIA labels to buttons
  - Add ARIA roles to sections
  - Add ARIA live regions
  - Test with screen reader

- [ ] Task 5.4.3: Color contrast improvements
  - Check all text contrast (WCAG AA)
  - Fix low contrast colors
  - Don't rely on color alone

- [ ] Task 5.4.4: Test accessibility
  - Run Lighthouse audit
  - Test with keyboard only
  - Test with screen reader

---

## Phase 6: Advanced Features (Future)

### 6.1 Member Portal (Future Phase)

- [ ] Task 6.1.1: Create member self-service booking
- [ ] Task 6.1.2: Member booking history
- [ ] Task 6.1.3: Membership renewal interface
- [ ] Task 6.1.4: Payment tracking dashboard

### 6.2 Staff Mobile App (Future Phase)

- [ ] Task 6.2.1: Create staff check-in/check-out interface
- [ ] Task 6.2.2: Cart status update quick buttons
- [ ] Task 6.2.3: Emergency contact access
- [ ] Task 6.2.4: Shift handoff notes

### 6.3 Custom Reporting (Future Phase)

- [ ] Task 6.3.1: Report builder interface
- [ ] Task 6.3.2: Custom metric selection
- [ ] Task 6.3.3: Scheduled email delivery
- [ ] Task 6.3.4: Real-time KPI widgets

---

## Dependencies & Packages to Add

### Charts & Visualization
- [ ] Install: `npm install recharts` (for analytics charts)
- [ ] Alternative: Chart.js or Victory for mobile

### UI Components
- [ ] Install: `npm install react-hot-toast` (for notifications)
- [ ] Install: `npm install react-day-picker` (date range picker)
- [ ] Install: `npm install @tanstack/react-table` (data tables)

### Form & Validation
- [ ] Install: `npm install zod` (schema validation)
- [ ] Install: `npm install react-hook-form` (form management)

### Mobile/Touch
- [ ] Install: `npm install react-swipeable` (swipe gestures)

### Utilities
- [ ] Already have: `date-fns` (date manipulation)
- [ ] Install: `npm install clsx` (conditional classnames)

---

## Testing Checklist

After each phase, verify:

- [ ] All components render without errors
- [ ] No console warnings or errors
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1024px)
- [ ] All buttons and links functional
- [ ] Form validation works
- [ ] Data loads from Firestore
- [ ] Real-time updates work
- [ ] Performance acceptable (<3s load time)

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No ESLint warnings
- [ ] No TypeScript errors
- [ ] Performance tested (Lighthouse score >85)
- [ ] Accessibility tested (Lighthouse score >85)
- [ ] Mobile responsive verified
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Build size acceptable
- [ ] No console errors in production build

---

## Risk Mitigation

**Known Issues to Watch:**

1. **Firestore Index Delay**
   - Composite index creation can take 5-10 minutes
   - Status: ⚠️ CRITICAL - MUST COMPLETE FIRST

2. **Real-time Performance**
   - Many simultaneous listeners can slow app
   - Solution: Use pagination, limit listeners

3. **Mobile Performance**
   - Availability grid may lag on older phones
   - Solution: Virtual scrolling, lazy loading

4. **Complex State Management**
   - Booking steps + admin dashboard = complex state
   - Solution: Consider Zustand for state management

---

## Progress Tracking

| Phase | Status | Start Date | End Date | Notes |
|-------|--------|-----------|----------|-------|
| Phase 1 | 🔲 Not Started | - | - | Week 1-2 |
| Phase 2 | 🔲 Not Started | - | - | Week 3-4 |
| Phase 3 | 🔲 Not Started | - | - | Week 5-6 |
| Phase 4 | 🔲 Not Started | - | - | Week 7-8 |
| Phase 5 | 🔲 Not Started | - | - | Week 9-10 |
| Phase 6 | 🔲 Not Started | - | - | Future |

---

## How to Use This List

1. **Before starting each phase:** Review the phase description
2. **Check off completed tasks:** Use ✅ when done (replace [ ] with [✅])
3. **Note date completed:** Add date after each completed task
4. **If issues arise:** Note in "Risk Mitigation" section
5. **Reference in commits:** Link to specific task numbers (e.g., "Fixes task 1.3.4")
6. **Daily updates:** Update progress tracking table

---

**Last Updated:** December 4, 2025  
**Next Review:** December 5, 2025
