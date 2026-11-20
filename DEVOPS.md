# DevOps Engineering Architecture & Implementation Guide — ScanX

This document outlines the complete, production-grade DevOps lifecycle implemented for **ScanX** (Next.js 16 + Prisma + PostgreSQL). It serves as both a operational handbook and your technical interview preparation reference.

---

## 1. Architectural Overview

```
                                  +------------------------------------+
                                  |        GitHub Actions CI/CD        |
                                  |------------------------------------|
                                  | 1. Lint & TypeScript Checking      |
                                  | 2. Prisma Schema Validation        |
                                  | 3. Multi-Stage Docker Build        |
                                  | 4. Trivy DevSecOps CVE Scan        |
                                  | 5. Publish to GHCR (ghcr.io)       |
                                  +-----------------+------------------+
                                                    |
                                                    v
                                      +---------------------------+
                                      | GitHub Container Registry |
                                      +-------------+-------------+
                                                    |
             +--------------------------------------+--------------------------------------+
             |                                                                             |
             v                                                                             v
+-----------------------------+                                             +-----------------------------+
|    Local Dev Environment    |                                             |    Kubernetes Production    |
|       (Docker Compose)      |                                             |     (Namespace: scanx-prod) |
|-----------------------------|                                             |-----------------------------|
|  - scanx-web (Port 3000)    |                                             |  - Ingress (SSL / TLS)      |
|  - scanx-postgres (Port 5432)                                             |  - Web Service (ClusterIP)   |
|  - Persistent Named Volume  |                                             |  - App Deployment (HPA 2-10)|
|  - Automated Healthchecks   |                                             |  - Postgres StatefulSet     |
+-----------------------------+                                             |  - ConfigMaps & Secrets     |
                                                                            +-----------------------------+
```

---

## 2. Directory Structure of DevOps Files

```
scanx/
├── .dockerignore                         # Excludes node_modules, build cache, local envs
├── Dockerfile                            # 4-stage production build (Alpine, standalone output, non-root user)
├── docker-compose.yml                    # Local multi-container setup (App + PostgreSQL + Healthchecks)
├── .env.docker.example                   # Example environment variables for Docker
├── DEVOPS.md                             # Architecture docs and interview guide
├── app/api/health/route.ts               # Healthcheck endpoint (Liveness/Readiness probes)
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Automated validation, linting & build testing
│       └── cd.yml                        # Automated container build, Trivy CVE scan & image registry push
└── k8s/
    ├── namespace.yaml                    # Isolated production namespace
    ├── configmap.yaml                    # Non-sensitive runtime configuration
    ├── secret.yaml                       # Database credentials and NextAuth secrets
    ├── postgres-statefulset.yaml         # Persistent PostgreSQL deployment with volumeClaimTemplates
    ├── app-deployment.yaml               # Web deployment with liveness/readiness probes & resource limits
    ├── app-service.yaml                  # ClusterIP service routing traffic to web pods
    ├── ingress.yaml                      # Nginx ingress controller with TLS termination
    └── hpa.yaml                          # Horizontal Pod Autoscaler (2 to 10 replicas based on CPU/RAM)
```

---

## 3. Key Components & Implementation Details

### A. Containerization (`Dockerfile` & `.dockerignore`)
* **Multi-Stage Build**:
  - `Stage 1 (base)`: `node:20-alpine` with `libc6-compat` & `openssl` for Prisma native binaries.
  - `Stage 2 (deps)`: Installs dependencies using `npm ci` for deterministic builds.
  - `Stage 3 (builder)`: Runs `npx prisma generate` and builds Next.js in standalone mode (`output: "standalone"`).
  - `Stage 4 (runner)`: Copies only `.next/standalone`, `.next/static`, and `public`. Reduces image size from ~1.2 GB to ~150 MB.
* **Security Hardening**:
  - Drops root privileges by creating a dedicated unprivileged user `nextjs` (`UID: 1001`, `GID: 1001`).

### B. Multi-Container Orchestration (`docker-compose.yml`)
* **Services**:
  1. `db`: `postgres:16-alpine` with persistent volume `scanx_pgdata` and automated `pg_isready` healthcheck.
  2. `web`: Next.js web application built from `Dockerfile`, configured with `depends_on: { db: { condition: service_healthy } }` to ensure zero startup crash loops.
* **Health Monitoring**:
  - Integrated `/api/health` endpoint with `wget` spider test.

### C. Continuous Integration & DevSecOps (`.github/workflows/`)
* **`ci.yml`**:
  - Validates Prisma schema (`npx prisma validate`).
  - Runs ESLint (`npm run lint`).
  - Enforces type safety (`npx tsc --noEmit`).
  - Tests compilation on Ubuntu runners with npm dependency caching.
* **`cd.yml`**:
  - Automated Docker Buildx multi-stage build.
  - GitHub Actions Cache (`type=gha`) for fast layer caching.
  - **Trivy Vulnerability Scanner**: Scans container layers for HIGH and CRITICAL CVEs before publishing.
  - Pushes production tags to GitHub Container Registry (`ghcr.io`).

### D. Kubernetes Production Manifests (`k8s/`)
* **Zero-Downtime Deployments**: `RollingUpdate` strategy with `maxSurge: 1` and `maxUnavailable: 0`.
* **Health Probes**:
  - `livenessProbe`: Verifies process vitality on `/api/health`. Restarts unresponsive pods.
  - `readinessProbe`: Verifies database connectivity before allowing traffic through the Service.
* **Resource Governance**: Strict `requests` (100m CPU, 256Mi RAM) and `limits` (500m CPU, 512Mi RAM) to prevent noisy neighbor problems and OOM kills.
* **Autoscaling**: `HorizontalPodAutoscaler` dynamically scales web pods between 2 and 10 replicas when CPU exceeds 75% or memory exceeds 80%.

---

## 4. Quick Command Reference

### Running Locally with Docker Compose
```bash
# Start the full stack (App + DB) in background
docker compose up -d --build

# View real-time logs
docker compose logs -f web

# Check health and status of containers
docker compose ps

# Test the health endpoint
curl http://localhost:3000/api/health

# Stop and remove containers
docker compose down
```

### Applying to a Kubernetes Cluster
```bash
# Apply in sequence
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Check pod status and rollout
kubectl get pods -n scanx-prod
kubectl rollout status deployment/scanx-web -n scanx-prod
```

---

## 5. Resume Bullet Points

Copy and customize these points for your resume:

- **End-to-End DevOps Lifecycle:** Architected and deployed a containerized production environment for a full-stack Next.js and PostgreSQL application using Docker, Docker Compose, and Kubernetes.
- **Container Optimization & Security:** Developed a 4-stage multi-stage Docker build utilizing Alpine Linux and Next.js standalone output, reducing image footprint by ~85% and securing runtime execution via unprivileged non-root users.
- **Automated CI/CD & DevSecOps:** Built GitHub Actions pipelines for automated linting, Prisma schema validation, TypeScript type checks, and automated image publishing with layer caching and Trivy container vulnerability scanning.
- **Kubernetes Orchestration:** Authored declarative K8s manifests including StatefulSets with persistent storage, zero-downtime RollingUpdate deployments, Liveness/Readiness probes, Nginx Ingress, and Horizontal Pod Autoscaling (HPA).
