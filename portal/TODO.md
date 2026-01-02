# Flight Club Portal - Master Implementation Plan

This document tracks the progress towards a fully "turnkey" flight club management solution.

## Phase 1: Core Infrastructure (✅ Completed)
- [x] **Database Schema**: Upgraded to support Tiers, Complex Reservations, Invoices, Maintenance, and Flight Logs.
- [x] **Flight Operations Logic**: Implemented backend actions for Check-in, Check-out, and Billing generation.
- [x] **Scheduling Rules Engine**: Created `lib/scheduling.ts` to validate bookings against club rules (Weekends, Holidays, Quotas).
- [x] **Aircraft Tracking**: Added ADS-B Hex Code support and embedded live tracking.

## Phase 2: Frontend & Operations (✅ Completed)
- [x] **Interactive Calendar**: Implemented `react-big-calendar` for block-style scheduling visualization.
- [x] **Check-in Wizard**: Created UI for Preflight Checklists, Meter Recording, and Flight Start.
- [x] **Active Flight Mode**: Created a dedicated dashboard for pilots in-flight.
- [x] **Check-out Wizard**: Created UI for Postflight Checklists, Fuel Reimbursement, and automatic Invoice generation.

## Phase 3: Billing & Finance (🚧 In Progress)
- [ ] **Stripe/PayPal Integration**:
    - [ ] Install `stripe` SDK.
    - [ ] Create API Route `/api/webhooks/stripe` to handle payment confirmation.
    - [ ] Add "Pay Now" button to Invoice Details page.
- [ ] **Membership Dues**: Create a recurring job (cron) or admin button to "Generate Monthly Dues" for all active members.
- [ ] **Suspension System**:
    - [ ] Create a `middleware.ts` check or login check.
    - [ ] If `User.balance > 0` AND `OldestUnpaidInvoice > 10 days`, set `User.status = SUSPENDED`.

## Phase 4: Maintenance Management (TODO)
- [ ] **Maintenance Dashboard**: Create `/aircraft/[id]/maintenance`.
    - [ ] List all active schedules (e.g. "Oil Change", "Annual").
    - [ ] Show status bars (Green/Yellow/Red) based on Hours/Date.
- [ ] **Edit Schedules**: Allow Admin to define new recurring maintenance items (Interval Hours / Interval Months).
- [ ] **Squawk Management**: Display "Squawks" (notes) from Flight Logs in the Maintenance dashboard so mechanics can address them.

## Phase 5: Advanced Configuration & Settings (TODO)
- [ ] **Club Settings UI**: Update `/settings` to manage:
    - [ ] Billing Cycle Day.
    - [ ] Overdue Suspension Threshold (Days).
    - [ ] Tax Rates (if applicable).
- [ ] **Membership Tiers UI**: Create a visual editor for Membership Tiers.
    - [ ] Set Booking Windows, Max Reservations, Hourly Discounts.
    - [ ] Set Weekend/Holiday limits.

## Phase 6: Dashboard & Analytics (TODO)
- [ ] **Main Dashboard Overhaul**: Replace the simple list with Widgets.
    - [ ] **Fleet Status**: Quick view of all aircraft (Available/In Use/Maintenance).
    - [ ] **Financials**: Monthly Revenue vs Expenses (Fuel Reimbursements).
    - [ ] **Personal**: "My Next Flight", "My Balance".
    - [ ] **Weather**: Integration with aviationweather.gov API for home airport.

## Phase 7: Integrations (Nice to Have)
- [ ] **Google Calendar Sync**:
    - [ ] Use Google Calendar API to push confirmed reservations to a shared Club Calendar.
    - [ ] Add "Add to My Calendar" button for users.

---
**Current Status**: The core Flight Operations loop (Book -> Check-in -> Fly -> Check-out -> Invoice) is functional. The next critical step is **Billing Integration** and **Maintenance UI**.
