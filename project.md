# GeoGuard - Project Status & Roadmap

## 🚀 Project Overview
GeoGuard is a secure, geolocation-based attendance system designed to prevent proxy attendance using device fingerprinting and location verification. The system features a robust role-based architecture (Admin, Faculty, Student) with a focus on security and real-time responsiveness.

---

## ✅ Completed Features & Enhancements

### 1. Authentication & User Workflow
- **Role-Based Access Control (RBAC)**: Secure routing for Admins, Faculty, and Students using NextAuth and custom Middleware/Proxy.
- **Approval Workflow**:
    - **Self-Registration**: New students start as `PENDING` and are redirected to a dedicated "Approval Pending" page.
    - **Real-Time Status Checks**: The pending page automatically polls for approval every 5 seconds. Once approved, the student is instantly redirected to the dashboard without manual page refreshes.
    - **Rejection Handling**: Admins can reject requests, which moves users to a `REJECTED` status and redirects them to a "Request Rejected" page (instead of deleting data).
    - **Admin-Created Users**: Manually added students/faculty and Bulk Uploads are **Auto-Approved** to streamline onboarding.

### 2. Admin Dashboard & Management
- **Optimized Bulk Upload**: Rebuilt the bulk upload engine to use database transactions and batch processing (`createMany`), significantly reducing upload time for large datasets.
- **Real-Time Admin Updates**: The Admin Dashboard and Student Lists automatically refresh every 5-10 seconds to show new incoming requests and live stats without manual reloading.
- **Confirmation Dialogs**: Secure confirmation modals for critical actions like Approving or Rejecting students.
- **Filtering**: The main student list filters out pending/rejected users, keeping the view clean. Pending users appear in a dedicated "Pending Requests" widget.

### 3. Security
- **Device Fingerprinting**: Students are locked to a specific device ID upon first login to prevent buddy punching.
- **Referential Integrity**: Database schemas updated (`onDelete: Cascade`) to ensure safe data management when removing users or batches.

### 4. UI/UX
- **Theming**: "Dark Mode" aesthetic implemented for Pending/Rejected pages with animated elements (pulsing clocks, loading spinners).
- **Feedback**: Clear visual feedback during data loading, approvals, and errors.

---

## 💡 Proposed Changes & Suggestions

Based on the current architecture, here are recommendations to elevate the project further:

### 1. ⚡ True Real-Time (WebSockets)
**Current**: We use "Short Polling" (Auto-refresh every 5s). This works well but creates unnecessary server load.
**Proposal**: Implement **WebSockets (Socket.io or Pusher)**.
- **Benefit**: Instant updates (0s delay) for pending requests and live attendance counts.
- **Benefit**: Reduced server load (no more constant checking).

### 2. 📧 Email Notifications
**Current**: Users must check the portal to see their status.
**Proposal**: Integrate **Resend** or **Nodemailer**.
- **Action**: Send an email when a student registers ("Request Received").
- **Action**: Send an email when Approved ("Access Granted") or Rejected ("Action Required").
- **Action**: Daily attendance summaries for Faculty.

### 3. 🛡️ Advanced Audit Logs
**Current**: Basic console logs.
**Proposal**: Create an `AuditLog` table in the database.
- **Track**: Who approved whom? Who deleted a batch? Who changed a grade?
- **UI**: An "Activity Log" page for Admins to trace all system changes.

### 4. 📊 Exportable Reports
**Current**: View only.
**Proposal**: Add **Export to PDF/Excel** for:
- Attendance sheets (for University submission).
- Student lists.
- Monthly analytics reports.

### 5. 📱 PWA (Progressive Web App) Support
**Current**: Web Browser.
**Proposal**: make the app installable on mobile phones.
- **Benefit**: Native-like experience for students (icon on home screen).
- **Benefit**: Better access to Geolocation APIs and potentially Biometric Auth integration.

### 6. 📍 Geofencing UI
**Current**: Coordinates might be hardcoded or basic.
**Proposal**: Integrate **Google Maps / Leaflet** in the Faculty dashboard to visually draw the allowed attendance zone (Geofence) for a class session.
