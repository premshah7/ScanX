# ScanX

ScanX is a comprehensive attendance management system that uses a combination of a web dashboard and a mobile application to streamline attendance tracking and prevent proxy attendance. 

The system leverages dynamic QR code scanning and device fingerprinting to ensure that students are physically present and using their own authorized devices.

---

## 🚀 Tech Stack

### Web & Backend (Next.js)
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Standalone Mode)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js / JWT
- **Features**: Dynamic QR Code Generation, FingerprintJS for device uniqueness

### Mobile App (Flutter)
- **Framework**: [Flutter](https://flutter.dev/)
- **Platform**: Android / iOS
- **Features**: Mobile Scanner (QR code scanning), Secure Storage for JWT tokens, Device Info for proxy prevention

### 🐳 DevOps, CI/CD & Cloud Infrastructure
- **Containerization**: Docker (4-Stage Multi-stage build with Debian Slim & Non-root user `nextjs`)
- **Orchestration**: Docker Compose (Web App + PostgreSQL 16 + Healthchecks + Persistent Storage)
- **CI/CD Automation**: GitHub Actions (Automated linting, TypeScript type-check, Prisma validation, Docker Buildx caching)
- **DevSecOps**: Trivy Container Vulnerability Scanner (scans image layers for CVEs prior to publishing)
- **Image Registry**: GitHub Container Registry (`ghcr.io`)
- **Kubernetes (K8s)**: Declarative manifests with Namespace, StatefulSet, RollingUpdate Deployment, Ingress, ClusterIP Service, and Horizontal Pod Autoscaler (HPA)
- **Observability**: Live `/api/health` endpoint monitoring server uptime and database connectivity

---

## ✨ Features

- **Role-based Access**: Supports multiple user roles including Admin, Faculty, Student, and Guest.
- **Session Management**: Faculty can create Subjects, Batches, and specific Sessions.
- **QR Code Attendance**: Dynamic QR codes are generated for sessions.
- **Anti-Proxy System**: 
  - Ties student accounts to specific physical devices using hardware identifiers.
  - Logs `ProxyAttempts` if attendance is attempted from an unauthorized device.
- **Real-time API**: The mobile app communicates securely with the Next.js REST API.
- **Health & Readiness Monitoring**: `/api/health` provides continuous status of application and database health for container orchestrators.

---

## 📁 Project Structure

```text
scanx/
├── app/                  # Next.js App Router (Web Dashboard & API Routes)
│   └── api/health/       # System health & DB connection probe
├── components/           # Reusable React components for the web app
├── prisma/               # Prisma schema and migrations (PostgreSQL)
├── .github/workflows/    # CI/CD Workflows (ci.yml & cd.yml)
├── k8s/                  # Kubernetes production manifests (Deployment, HPA, StatefulSet)
├── Dockerfile            # Production multi-stage Docker build
├── docker-compose.yml    # Multi-container orchestration (Web + PostgreSQL)
├── DEVOPS.md             # Complete DevOps architecture & interview handbook
└── public/               # Static assets for the web app
```

---

## 🛠️ Getting Started

### Option A: Running with Docker Compose (Recommended - Quickest)

You do not need to install Node.js, Prisma, or PostgreSQL locally. Docker runs the entire stack inside containers:

1. **Start the complete stack (Web App + PostgreSQL Database):**
   ```bash
   docker compose up -d --build
   ```

2. **Check container status:**
   ```bash
   docker compose ps
   ```

3. **View live logs:**
   ```bash
   docker compose logs -f web
   ```

4. **Access the application:**
   - Web App: `http://localhost:3000`
   - Health Monitor: `http://localhost:3000/api/health`

5. **Stop everything:**
   ```bash
   docker compose down
   ```

---

### Option B: Local Manual Setup

#### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [PostgreSQL](https://www.postgresql.org/) database running locally
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (if running mobile app)

1. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL in the .env file
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run database migrations and generate Prisma client:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   The backend API and web dashboard will be available at `http://localhost:3000`.

---

## 🚢 Kubernetes Production Deployment

To deploy ScanX on a Kubernetes cluster:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

For detailed architecture explanations, security practices, and interview questions, refer to [**`DEVOPS.md`**](./DEVOPS.md).

---

## 📄 License
This project is proprietary and confidential.
