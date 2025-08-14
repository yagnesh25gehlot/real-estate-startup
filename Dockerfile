# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install --only=production
RUN cd backend && npm install --only=production
RUN cd frontend && npm install

# Build the frontend
FROM base AS frontend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm run build

# Build the backend
FROM base AS backend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built applications
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/dist ./frontend/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/prisma ./backend/prisma

# Copy necessary files
COPY --chown=nextjs:nodejs backend/package*.json ./backend/
COPY --chown=nextjs:nodejs package*.json ./

# Create uploads directory
RUN mkdir -p /app/backend/uploads/properties /app/backend/uploads/profiles /app/backend/uploads/payments /app/backend/uploads/aadhaar
RUN chown -R nextjs:nodejs /app/backend/uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "backend/dist/index.js"]
