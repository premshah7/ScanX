# ==============================================================================
# Multi-Stage Production Dockerfile for ScanX (Next.js 16 + Prisma)
# Using Debian Slim for rock-solid glibc compatibility (prevents Alpine SIGSEGV)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base Environment
# ------------------------------------------------------------------------------
FROM node:20-slim AS base
WORKDIR /app
# Install OpenSSL and certificates required for Prisma and PostgreSQL SSL
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------------------------
# Stage 2: Dependencies Installation
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Use --ignore-scripts to avoid running postinstall prisma generate before schema is copied
RUN npm ci --ignore-scripts

# ------------------------------------------------------------------------------
# Stage 3: Source Build & Prisma Generation
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client with schema present
RUN npx prisma generate

# Build Next.js application in standalone mode
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Security Best Practice: Create non-root dedicated service user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# Copy only the compiled standalone server and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch from root to unprivileged user
USER nextjs

EXPOSE 3000

# Next.js standalone entrypoint
CMD ["node", "server.js"]
