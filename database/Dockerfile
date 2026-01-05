# Custom PostgreSQL Dockerfile
FROM postgres:15-alpine

# Install additional tools
RUN apk add --no-cache bash

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD pg_isready -U todo_user -d todoapp

# Custom PostgreSQL configuration
RUN echo "shared_preload_libraries = 'pg_stat_statements'" >> /usr/local/share/postgresql/postgresql.conf.sample && \
    echo "pg_stat_statements.track = all" >> /usr/local/share/postgresql/postgresql.conf.sample

# Set environment variables (can be overridden in docker-compose)
ENV POSTGRES_DB=todoapp
ENV POSTGRES_USER=todo_user
ENV POSTGRES_PASSWORD=todo_password

# Run as non-root (PostgreSQL already runs as postgres user)
USER postgres

# Expose port
EXPOSE 5432

# Default command (from parent image)
CMD ["postgres"]
