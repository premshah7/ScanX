# ScanX

ScanX is a comprehensive attendance management system that uses a combination of a web dashboard and a mobile application to streamline attendance tracking and prevent proxy attendance. 

The system leverages QR code scanning and device fingerprinting to ensure that students are physically present and using their own devices.

## 🚀 Tech Stack

### Web & Backend (Next.js)
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js / JWT
- **Features**: QR Code Generation, FingerprintJS for device uniqueness

### Mobile App (Flutter)
- **Framework**: [Flutter](https://flutter.dev/)
- **Platform**: Android / iOS
- **Features**: Mobile Scanner (QR code scanning), Secure Storage for JWT tokens, Device Info for proxy prevention

## ✨ Features

- **Role-based Access**: Supports multiple user roles including Admin, Faculty, Student, and Guest.
- **Session Management**: Faculty can create Subjects, Batches, and specific Sessions.
- **QR Code Attendance**: Dynamic QR codes are generated for sessions.
- **Anti-Proxy System**: 
  - Ties student accounts to specific physical devices using hardware identifiers.
  - Logs `ProxyAttempts` if attendance is attempted from an unauthorized device.
- **Real-time API**: The mobile app communicates securely with the Next.js REST API.

## 📁 Project Structure

```text
ScanX-mobile/
├── app/                  # Next.js App Router (Web Dashboard & API Routes)
├── components/           # Reusable React components for the web app
├── prisma/               # Prisma schema and migrations (PostgreSQL)
├── mobile/               # Flutter mobile application codebase
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/         # Core utilities and API constants
│   │   ├── presentation/ # Flutter UI screens
│   │   └── providers/    # State management (Provider)
└── public/               # Static assets for the web app
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Flutter SDK](https://docs.flutter.dev/get-started/install)
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Web / Backend Setup

1. Copy the environment variables example and configure your database:
   ```bash
   cp .env.example .env
   # Update DATABASE_URL in the .env file
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run database migrations and generate Prisma client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The backend API and web dashboard will be available at `http://localhost:3000`.
## 📄 License
This project is proprietary and confidential.
