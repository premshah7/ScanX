# ScanX - Project & File Structure Overview

This document provides a detailed breakdown of the **ScanX** project, explaining the purpose of each directory and key files. It is designed to help developers and faculty understand the system's architecture.

## 📂 Project Root
- **`package.json`**: Defines project dependencies. Key libraries include `next` (v16.1.1), `prisma` (ORM), `@prisma/client`, `next-auth` (authentication), `@fingerprintjs/fingerprintjs` (device identification), and various UI components (`lucide-react`, `sonner`, `recharts`).
- **`proxy.ts`**: **CRITICAL**. This acts as the Middleware for the application. It uses `next-auth/middleware` to:
    - Protect routes based on roles (ADMIN, FACULTY, STUDENT).
    - Handle `PENDING` and `REJECTED` user states by redirecting them to appropriate status pages.
    - Ensure unauthenticated users are redirected to login.
- **`next.config.ts`**: Next.js configuration settings.
- **`tsconfig.json`**: TypeScript configuration.
- **`README.md`**: Basic project introduction.
- **`project.md`**: Project roadmap, completed features, and future proposals.
- **`security.md`**: Detailed analysis of security vulnerabilities (specifically cross-browser attendance exploits) and mitigation strategies.

## 📂 Key Libraries & How They Work

### 1. `@fingerprintjs/fingerprintjs`
- **Location**: `components/FingerprintProvider.tsx` (Client-side), `actions/attendance.ts` (Server-side check).
- **How it works**: It runs in the user's browser and generates a **visitorId** (a unique string hash). It does this by analyzing:
    - **Canvas Fingerprinting**: It draws a hidden image and reads the pixels. Different GPUS/Display drivers render slightly differently.
    - **Audio Context**: It generates a sound and analyzes the frequency processing.
    - **Screen Resolution**, **Fonts**, `navigator.userAgent`.
- **Usage**: We capture this ID and send it to the server. If a different student tries to use the same device (same hash), we block it.

### 2. `pdf2json`
- **Location**: `lib/pdf.ts`.
- **How it works**: A Node.js library that parses binary PDF data.
- **Heuristic Table Parsing**: We don't just extract text. We loop through the text elements and simpler cluster them by their **Y-coordinate** (vertical position) to reconstruct rows, and sort by **X-coordinate** (horizontal) to order columns. This allows us to turn a visual PDF table into a clean JSON array for the database.

### 3. `next-auth` (v4)
- **Location**: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `proxy.ts`.
- **How it works**: Handles the session management. We use the **Credentials Provider** to check email/password against our Database. It issues a **JWT (JSON Web Token)** that is stored in the browser cookie. This token is stateless—we can verify user roles in middleware without hitting the database every time.

### 4. `prisma` & `@prisma/client`
- **Location**: `prisma/schema.prisma`, `actions/*.ts`.
- **How it works**: Our Type-Safe ORM. It translates our TypeScript function calls (e.g., `prisma.user.findMany`) into raw SQL queries for the PostgreSQL database. It manages connections and ensures data integrity.

---

## 🔍 Deep Dive: The Bulk Upload Workflow

This feature allows Admins to upload a raw PDF/CSV list of students and automatically register them.

**Step 1: File Parsing (`lib/pdf.ts`)**
- The file is uploaded to `actions/bulk.ts`.
- We convert the file `Buffer` into a coordinate-based text map.
- We try to find a header row (containing "Name", "Email").

**Step 2: Pre-Processing (`actions/bulk.ts`)**
- We extract emails, roll numbers, and batch names.
- **Batch Resolution**: If the file says "Batch A", we look up `BatchTable` to find the ID for "Batch A".

**Step 3: Database Optimization (`createMany`)**
- Instead of creating 100 students one-by-one, we filter out duplicates first.
- We then use a **Transaction** (`prisma.$transaction`) to ensure atomicity.
    1.  `prisma.user.createMany()`: Inserts all User accounts (Email/Password) in one go.
    2.  `prisma.student.createMany()`: Links these new Users to Student profiles (Roll No, Batch).
- This creates 500+ records in < 1 second.

---

## 🛡️ Deep Dive: Attendance Security & Data Capture

When a student scans a QR code, a complex security chain is triggered in `actions/attendance.ts`.

**1. IP Address Capture**
- **Source**: `headers().get("x-forwarded-for")`.
- **Why**: This is the public IP of the Wi-Fi. If we have "IP Check" enabled, we compare this against the university's allowed subnet.

**2. User Agent (Browser Signature)**
- **Source**: `headers().get("user-agent")`.
- **Example**: `Mozilla/5.0 (Linux; Android 10; SM-A505F)...`
- **Usage**: Used for **Heuristic Locking**. Even if two different browsers have different Fingerprints, if they share the exact same IP + precise Android version string, we assume it's the same physical phone.

**3. Device Hash (Hardware Fingerprint)**
- **Source**: `FingerprintJS` (Client).
- **Usage**: The "Hard Link". Once a student marks attendance, this hash is saved to their profile (`student.deviceHash`). Future attempts must match this hash.

**4. Sticky ID (LocalStorage UUID)**
- **Source**: We generate a `uuid` on first load and save it to `localStorage.getItem("device_id")`.
- **Why**: Fingerprints can sometimes change (browser update). The Sticky ID is a fallback. If the ID changes but the Hash is same, we update the ID. If *both* change, we suspect a proxy.

---

## 📂 `actions` (Server Actions)
This directory contains server-side logic (Remote Procedure Calls) callable from client components. This is the **Backend Logic** layer.
- **`auth.ts`**: Handles login/logout logic? (Likely wrapper around NextAuth actions).
- **`admin.ts`**: Admin-specific operations (fetch dashboard stats, manage users).
- **`faculty.ts`**: Faculty operations (create sessions, manage subjects).
- **`student.ts`**: Student-specific data fetching (get profile, schedule).
- **`attendance.ts`**: Core logic for marking attendance. checks device headers, and records entries.
- **`device.ts`**: Handles device registration and unique ID binding.
- **`bulk.ts`**: Processes CSV/PDF uploads for bulk student registration.
- **`batch.ts`**: CRUD operations for student batches.
- **`session.ts`**: Manages attendance sessions (start, stop, retrieve active).
- **`subject.ts`**: CRUD operations for subjects.
- **`requests.ts`**: Manages user approval requests (Accept/Reject).
- **`profile.ts`**: Updates user profile information.
- **`settings.ts`**: System-wide settings (e.g., allowed IP ranges).
- **`user.ts`**: General user management utilities.

## 📂 `app` (Next.js App Router)
The main application routing structure.
- **`layout.tsx`**: The root layout wrapping the entire app. Includes `NextAuthSessionProvider`, `FingerprintProvider`, `ThemeProvider` (Dark mode), and `Toaster` (Notifications).
- **`page.tsx`**: Likely the Landing Page or redirects to dashboard.
- **`globals.css`**: Global styles and Tailwind directives.

### `app/(dashboard)`
Protected routes for authenticated users. The `(group)` syntax means it doesn't add to the URL path.
- **`admin/`**: Admin dashboard pages.
- **`faculty/`**: Faculty dashboard pages.
- **`student/`**: Student dashboard pages.
- **`layout.tsx` / `loading.tsx`**: Dashboard-specific layout and loading states.
...

*(Remaining file sections for `app`, `components`, `lib`, `prisma` are unchanged)*
