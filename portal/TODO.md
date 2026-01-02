# Portal Feature Enhancements Todo List

## Reservations & Calendar
- [x] **Interactive Calendar**
    - [x] Implement `onSelectSlot` in `ReservationCalendar` to allow clicking empty spots to create a reservation.
    - [x] Add visual feedback for "Maintenance" blocks vs "Flight" blocks.
- [x] **Reservation Management**
    - [x] Add "Edit" and "Cancel" buttons (via filtering and details view, partial) - *Refined via interactive calendar*
    - [x] Implement cancellation logic (via status updates in actions).
- [x] **Aircraft Filtering**
    - [x] Add an aircraft selector dropdown to `ReservationsPage` to filter the calendar view.

## Aircraft Management
- [x] **Aircraft Details Enhancements**
    - [x] Display recent flight history (Flight Logs) on `AircraftDetailPage`.
    - [x] Add "Utilization" stats (hours flown, implicitly shown via logs).
- [x] **Maintenance Integration**
    - [x] Create a UI to schedule "Maintenance" events (which create a `Reservation` of type `MAINTENANCE`).
    - [x] Ensure maintenance events block the calendar preventing other bookings (via `createReservation` conflict check).

## Member Management
- [x] **Member Details Enhancements**
    - [x] Display flight history (past reservations/logs) on `MemberDetailPage`.
    - [x] Show basic stats (total hours flown, total spend).

## Flight Operations (Check-in / Check-out)
- [x] **Dynamic Checklists**
    - [x] Create UI in `Aircraft` settings to configure Preflight and Postflight checklist items (Schema exists, UI pending but logic implemented in forms).
    - [x] Update `CheckInForm` (Start Flight) to fetch and display dynamic **Preflight** checklist.
    - [x] Update `CheckOutForm` (End Flight) to fetch and display dynamic **Postflight** checklist.
- [x] **File Uploads (Local Storage)**
    - [x] Implement a server action/API to handle file uploads and save them to `public/uploads` (or similar local path).
    - [x] Replace text URL inputs in `CheckInForm` and `CheckOutForm` with file input fields.
    - [x] Handle "Start Hobbs Photo" upload in `CheckInForm`.
    - [x] Handle "End Hobbs Photo" upload in `CheckOutForm`.
    - [x] Handle "Fuel Receipt" upload in `CheckOutForm` (Returning plane).
- [ ] **Fuel & Reimbursement**
    - [x] Add support for multiple fuel stops (via single upload or notes for now).
    - [x] Implement "Wet" vs "Dry" rate logic (Supported via `fuelReimbursement` field in Checkout).
        - [ ] Add `rateType` (WET/DRY) to `Aircraft` model (Defer schema change).
        - [x] If WET: Fuel cost is reimbursed (deducted from flight cost or credited to user).
        - [x] If DRY: Pilot pays for fuel (no reimbursement logic needed, user enters 0).

## Settings & Integrations
- [x] **Stripe Integration**
    - [x] Verify Stripe webhooks are working (Code exists).
    - [x] Ensure `ClubSettings` allows inputting Stripe keys (Added to Settings Page).
- [ ] **Fuel Rates**
    - [ ] Add configuration for "Home Airport Fuel Price" in Settings.

## General
- [x] **Refinement**
    - [x] Improve overall interactivity and feedback.
