# Tasks: Unique Username for Event Guests

- [ ] **Phase 1: Database Schema** <!-- id: 1 -->
    - [ ] Add `username` to User model (Unique, Optional) <!-- id: 2 -->
    - [ ] Run Migration (Push) <!-- id: 3 -->

- [x] **Phase 2: Use Interface** <!-- id: 4 -->
    - [x] **Login Page**: Update to accept `username` in Mobile Tab <!-- id: 5 -->
    - [x] **Register Page**: Add Student/Guest Toggle <!-- id: 6 -->
    - [x] **Register Page**: Implement Guest validation (Phone, Username) <!-- id: 18 -->
    - [x] Update `signIn` call to include `username` <!-- id: 19 -->

- [x] **Phase 2.1: Guest Password Removal** <!-- id: 21 -->
    - [x] **Register Page**: Remove Password Field for Guests <!-- id: 22 -->
    - [x] **Login Page**: Make Password Optional for Guests <!-- id: 23 -->
    - [x] **Backend**: Skip password check for `GUEST` role <!-- id: 24 -->

- [ ] **Phase 3.1: Route Refactor** <!-- id: 25 -->
    - [ ] **Rename Directory**: `app/(event)` -> `app/event` <!-- id: 26 -->
    - [ ] **Update Redirect**: `app/page.tsx` -> `/event/check-in` <!-- id: 27 -->

- [x] **Phase 3.1: Route Refactor** <!-- id: 25 -->
    - [x] **Rename Directory**: `app/(event)` -> `app/event` <!-- id: 26 -->
    - [x] **Update Redirect**: `app/page.tsx` -> `/event/check-in` <!-- id: 27 -->
    - [x] **Implement QR Scanner**: `app/event/check-in/page.tsx` <!-- id: 28 -->

- [x] **Phase 4: Organizer Role Implementation** <!-- id: 30 -->
    - [x] **Database Schema**: Add `ORGANIZER` Role & `EventManagers` (User) relation <!-- id: 31 -->
    - [x] **Migration**: Migrate existing Faculty organizers to User-based relation <!-- id: 32 -->
    - [x] **Backend logic**: Update `event_organizer.ts` to use `User` relation and allow `ORGANIZER` role <!-- id: 33 -->
    - [x] **UI Updates**: Ensure Organizer dashboard works (backend updated, UI compatible) <!-- id: 34 -->

- [ ] **Phase 5: Verification** <!-- id: 10 -->
    - [x] Test with existing phone (Login) <!-- id: 11 -->
    - [x] Test with new phone + taken username (Error) <!-- id: 12 -->
    - [x] Test with new phone + unique username (Success) <!-- id: 13 -->
    - [x] **New**: Test with Email/Username OTP <!-- id: 14 -->
- [x] **Phase 6: UI Overhaul - Sidebar** <!-- id: 40 -->
    - [x] **Layout Refactor**: Update `app/(dashboard)/layout.tsx` to implement `Sidebar` for all roles <!-- id: 41 -->
    - [x] **Cleanup**: Remove `AdminNavbar`, `FacultyNavbar` from sub-layouts <!-- id: 42 -->
    - [x] **Mobile Support**: Ensure `MobileSidebar` is integrated <!-- id: 43 -->

- [x] **Phase 7: Admin - Add Organizer** <!-- id: 50 -->
    - [x] **Server Action**: `createOrganizer` in `actions/admin.ts` <!-- id: 51 -->
    - [x] **UI Component**: `CreateOrganizerModal` <!-- id: 52 -->
    - [x] **Integration**: Add button to Admin Dashboard <!-- id: 53 -->

- [x] **Phase 8: Admin - Event Enhancements** <!-- id: 60 -->
    - [x] **Database Schema**: Add `description` to `Subject` model <!-- id: 61 -->
    - [x] **Server Action**: Update `createSubject`, `createEvent`, `getEvents` for description and guest count <!-- id: 62 -->
    - [x] **Add Event Description & Guest Count**
- [ ] **Phase 10: Guest Management & Event Config**
    - [x] Cleanup Organizer Dashboard (Remove Analytics).
    - [x] Implement `EventConfigModal` (Dynamic Fields).
    - [x] Implement `GuestManager` (List & Approve/Reject).
- [x] **Phase 11: Event Settings Page**
    - [x] Create `/organizer/event/[eventId]/settings` page.
    - [x] Migrate configuration logic from Modal to Page.
    - [x] Add "Copy Event Link" feature.
- [ ] **Phase 9: Separate Organizer Dashboard**
    - [x] Create `/organizer` layout and page.
    - [x] Update `ORGANIZER` redirect to `/organizer`.
    - [x] Update Sidebar links for `ORGANIZER`.
    - [x] Customize Organizer Dashboard UI (Events & Guests).
- [x] **Fix Organizer Dashboard Visibility:**
- [x] **Fix Organizer Dashboard Visibility:**
    - [x] Redirect `ORGANIZER` to `/faculty` dashboard.
    - [x] Refactor `FacultyDashboard` to fetch `managedEvents` (User relation).
    - [x] Update `actions/faculty` to support User-based stats and analytics.
    - [x] **UI Component**: Add description field to `AddEventForm` <!-- id: 63 -->
    - [x] **UI Component**: Display description and guest count in `EventList` <!-- id: 64 -->
