# Backend Dockerfile - Node.js API
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node docker-healthcheck.js

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
