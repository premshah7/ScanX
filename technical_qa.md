# GeoGuard - Technical Viva & Interview Q&A

This document contains a curated list of technical questions regarding the GeoGuard project, organized by difficulty level to help you prepare for your viva or interview.

---

## 🟢 Level 1: The Basics (Easy)

**Q1: Why did you choose Next.js with the App Router for this project?**
**A:** Next.js provides a robust production-ready framework. The **App Router** (introduced in v13) offers specific advantages:
- **Server Components**: We can render sensitive logic (like fetching Admin stats) entirely on the server, improving security and reducing the amount of JavaScript sent to the client.
- **Server Actions**: It simplifies backend logic. Instead of creating a separate API layer with Express/Node, we define asynchronous functions in `actions/` that can be called directly from our UI components with full type safety.

**Q2: What is the difference between the `actions/` folder and `app/api/` folder?**
**A:**
- **`actions/` (Server Actions)**: Contains 90% of our backend logic (Form submissions, Marking attendance, User updates). These are special functions that run on the server but are invoked like standard JavaScript functions from the client.
- **`app/api/` (Route Handlers)**: Contains standard REST API endpoints. We utilize these only when we need a specific public URL or external callback, such as for the `next-auth` authentication provider.

**Q3: How do you capture the user's IP address and User Agent?**
**A:**
We capture these securely on the server side inside our Server Actions (specifically `actions/attendance.ts`).
- **IP Address**: We read `headers().get("x-forwarded-for")`. In production (Vercel/AWS), this header contains the client's original IP.
- **User Agent**: We read `headers().get("user-agent")`. This string identifies the browser and OS version.
- **Safety**: Since we read these from *request headers* on the server, regular users cannot easily spoof them without advanced tools.

**Q4: How do you ensure that if a Faculty is deleted, their Subjects are also removed?**
**A:**
We utilize **Referential Integrity** at the database level. In our `schema.prisma` file, we define relationships with `onDelete: Cascade`.
*Example*: `Faculty @relation(fields: [userId], references: [id], onDelete: Cascade)`.
This ensures that the database engine automatically cleans up related records (orphans), preventing data inconsistency.

---

## 🟡 Level 2: Core Implementation (Medium)

**Q5: How does your Role-Based Access Control (RBAC) work?**
**A:**
We use a custom Middleware implementation in `proxy.ts`.
1.  **Interception**: Every request is intercepted before it reaches the page.
2.  **Token Check**: We decode the user's secure JSON Web Token (JWT).
3.  **Route Guarding**:
    - If logic detects a `STUDENT` trying to access `/admin`, it redirects to `/unauthorized`.
    - If it detects a `PENDING` user, it locks them to the `/pending` page.
This ensures security at the *routing* level, not just the *component* level.

**Q6: Detailed Explanation: How does the PDF Bulk Upload actually work?**
**A:**
The workflow in `actions/bulk.ts` and `lib/pdf.ts` is as follows:
1.  **Buffer Reception**: The server receives the file as a binary Buffer.
2.  **Coordinate Parsing (The "Magic")**: We use the `pdf2json` library. Instead of just grabbing text, we iterate through every text element in the PDF.
    - We group elements that share a similar **Y-coordinate** (Row).
    - We sort elements in that group by their **X-coordinate** (Column).
    - This reconstructs the visual table structure into 2D Array.
3.  **Data Extraction**: We assume the existence of headers like "Name", "Email". We map the columns dynamically to our Student Schema.
4.  **Transaction**: Finally, we perform an Atomic Transaction to insert users and profiles simultaneously.

**Q7: Technical details: How is the fingerprint generated and saved?**
**A:**
1.  **Provider**: We wrap our app in a `FingerprintProvider`.
2.  **Generation**: Inside `useEffect`, we call `FingerprintJS.load()` which downloads the agent. It runs a series of tests (Canvas rendering, Audio context freq analysis) to generate a unique `visitorId`.
3.  **Transmission**: When scanning a QR code, this `visitorId` is passed as an argument to `markAttendance`.
4.  **Verification**: The server compares this ID against the `deviceHash` stored in the `Student` table. If it's the student's first time, we **bind** (save) it. If it's a subsequent time, we **verify** it matches.

**Q8: Explain how the "Bulk Upload" feature is optimized for performance.**
**A:**
Instead of inserting students one by one (which would trigger N distinct database queries), we use a batching strategy:
1.  **Parsing**: The file (CSV/PDF) is parsed into a JSON array in memory.
2.  **Transactions**: We use Prisma's `createMany` API.
This allows us to insert hundreds of records in a **single database transaction**, reducing the operation time from potentially minutes to a few milliseconds.

---

## 🔴 Level 3: Advanced & System Design (Hard)

**Q9: What are the limitations of Browser Fingerprinting, and how did you mitigate them?**
**A:**
*The problem*: FingerprintJS is browser-scoped. Chrome generates ID `A`, but Firefox generates ID `B` on the *same device*. A student could technically mark attendance once on Chrome and once on Firefox for a friend.
*The Solution*: **Heuristic Locking**.
We implemented a server-side check that looks at `(IP Address + User Agent OS)`. If we see two different students marking attendance from the exact same IP and identical Android/iOS version string within the same class session, we flag it as suspicious, even if their Fingerprint IDs are different.

**Q10: If this app had to scale to 10,000 concurrent users, what part would break first?**
**A:**
The **Pending Page Polling** mechanism.
*Current Architecture*: Every pending user sends a request every 5 seconds to check their status.
*At Scale*: 10,000 users = 2,000 requests per second. This is a self-inflicted DDoS attack on our database.
*Solution*: We would need to replace Short Polling with **WebSockets** (using Socket.io) or **Server-Sent Events (SSE)**. This would allow the server to push a single "Approved" notification to the client only when the status actually changes, eliminating 99% of the traffic.

**Q11: Why use JWTs (JSON Web Tokens) instead of Database Sessions for this attendance system?**
**A:**
JWTs allow our authentication to be **stateless**. The user's role and ID are encoded directly into the token stored in their browser cookie.
- **Performance**: The middleware (`proxy.ts`) can verify a user's role purely by decoding the token, *without* needing to query the database on every single page load. This significantly reduces latency and database load, which is critical for a high-traffic attendance app.

**Q12: If we built this as a Flutter/React Native app, could we grab the device's MAC Address for 100% security?**
**A:**
Actually, **No**.
- **Modern OS Privacy**: Both iOS (since iOS 7) and Android (since Android 11/Android M) have completely blocked access to the hardware MAC address for standard apps to prevent user tracking.
- **The Behavior**: If you try to request it programmatically, Android returns a dummy address (`02:00:00:00:00:00`) and iOS returns nothing or a random value.
- **The Alternative**: In a mobile app, we would instead use the **`identifierForVendor` (iOS)** or **`ANDROID_ID`**, which are unique to the app/vendor but not the permanent hardware ID. So, while a native app offers *better* persistence than a browser, it still cannot access the raw MAC address without Root privileges.
