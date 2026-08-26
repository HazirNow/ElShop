# ==========================================
# ElShop Production Container Deployment Engine
# Multi-Stage Dockerfile for High-Density UAE Pilot
# ==========================================

# Stage 1: The Compilation and Bundling Layer
FROM node:20-alpine AS builder
WORKDIR /app

# Install project requirement manifests
COPY package*.json ./
RUN npm ci

# Pull remaining source directory files and build the production distribution payload
COPY . .
RUN npm run build

# Stage 2: The Lightweight Runtime Execution Layer
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install ONLY runtime dependencies to compress image file size
COPY package*.json ./
RUN npm ci --only=production

# Pull the compiled distribution files and the bundled server.cjs executable
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
