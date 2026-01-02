# Feature Installation To-Do List

This document outlines the remaining steps to fully realize the "turnkey" flight club management solution.

## 1. System Infrastructure (Completed in Schema)
- [x] **Database Schema**: Updated `schema.prisma` to support Membership Tiers, complex Reservations, Flight Logs, Invoices, and Maintenance Schedules.
- [ ] **Database Migration**: Run `rebuild.sh` or `prisma db push` to apply changes.

## 2. Scheduling & Calendar
- [ ] **Rules Engine Integration**: Connect `lib/scheduling.ts` to the `createReservation` server action to enforce:
    - Max trip length
    - Booking windows
    - Weekend/Holiday limits
    - Account suspension status
- [ ] **Interactive Calendar**: Replace the basic list/table view in `/reservations` with a library like `react-big-calendar` or `FullCalendar`.
    - Display "Blocks" of time.
    - Color code by User or Aircraft.

## 3. Flight Operations (Check-in / Check-out)
- [ ] **Active Flight Dashboard**: Create `/reservations/[id]/active` page.
    - Show Start Hobbs/Tach (read-only after check-in).
    - Show "End Flight" button.
- [ ] **Check-in Wizard**: Create `/reservations/[id]/checkin` UI.
    - Step 1: Preflight Checklist (Interactive checkboxes).
    - Step 2: Record Start Hobbs/Tach (Validate against current aircraft times).
    - Step 3: Upload Photos (Hobbs/Tach).
- [ ] **Check-out Wizard**: Create `/reservations/[id]/checkout` UI.
    - Step 1: Postflight Checklist.
    - Step 2: Record End Hobbs/Tach.
    - Step 3: Fuel Inputs (Gallons, Cost, Receipt Upload).
    - Step 4: Summary & Invoice Generation.

## 4. Billing & Finance
- [ ] **Stripe Integration**:
    - Install `stripe` node package.
    - Create API route for Payment Intents.
    - Create "Pay Now" button on Invoice page.
- [ ] **Automated Invoicing**: Ensure `checkOutReservation` action correctly creates Invoices (Logic implemented, needs testing).
- [ ] **Suspension Logic**: Create a Middleware or Global Check that runs on login to set `User.status = SUSPENDED` if `Invoice.status = OVERDUE` for > 10 days.

## 5. Maintenance
- [ ] **Maintenance Schedule UI**: Create `/aircraft/[id]/maintenance` settings page.
    - Add/Edit recurring schedules (e.g. "Oil Change", "50 Hr").
- [ ] **Dashboard Alerts**: Update the main Dashboard to show "Maintenance Due" alerts based on `lib/maintenance.ts`.

## 6. Dashboard Improvements
- [ ] **Widgets**:
    - "My Next Flight"
    - "Fleet Status" (Green/Red/Yellow indicators)
    - "Club Balance" (Admin only)
    - "Weather" (Integration with aviation weather API)

## 7. Setup & Configuration
- [ ] **Club Settings Page**: Enhance `/settings` to allow editing of all new global variables (overdue days, suspend thresholds, etc.).
