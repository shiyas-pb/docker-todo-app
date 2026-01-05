# Frontend Dockerfile - Complete nginx config
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create cache directories with proper permissions
RUN mkdir -p /var/cache/nginx/proxy_temp /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx

# Create temp directory for pid file
RUN mkdir -p /tmp && \
    chown -R nginx:nginx /tmp && \
    chmod -R 755 /tmp

# Replace the entire nginx.conf with our version
COPY nginx-complete.conf /etc/nginx/nginx.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom server config
COPY nginx.conf /etc/nginx/conf.d/

# Copy static files
COPY src/ /usr/share/nginx/html/

# Set proper permissions for web files
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to nginx user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start nginx (pid is already set in nginx-complete.conf)
CMD ["nginx", "-g", "daemon off;"]
