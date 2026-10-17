FROM node:22-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Dependency layer — cache-friendly: only rerun when package*.json changes
COPY package*.json ./
COPY patches ./patches/
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Source & build
COPY . .
RUN npx prisma generate && npm run build

# Keep Prisma CLI, tsx and TypeScript for schema setup and the custom server.

# Production image
FROM node:22-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/scripts ./scripts

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && (if [ -n \"$ADMIN_EMAIL\"] && [ -n \"$ADMIN_PASSWORD\"]; then node scripts/setup-admin.js \"$ADMIN_EMAIL\" \"$ADMIN_PASSWORD\"; fi) && node node_modules/tsx/dist/cli.mjs src/server/index.ts"]
