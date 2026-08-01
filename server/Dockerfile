# ====================================================
# Stage 1: Build TypeScript Code & Prisma Client
# ====================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies cleanly
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client & Compile TypeScript
RUN npx prisma generate
RUN npm run build

# ====================================================
# Stage 2: Production Execution Container
# ====================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root node user for security
USER node

# Copy compiled dist, prisma, and node_modules from builder
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
