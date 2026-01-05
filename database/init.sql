-- Initialize Todo App Database
-- This script runs when the PostgreSQL container starts

-- Create database if it doesn't exist (handled by docker-compose)
-- CREATE DATABASE todoapp;

-- Connect to todoapp database
\c todoapp;

-- Create user with password (if not exists)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'todo_user') THEN
      
      CREATE USER todo_user WITH PASSWORD 'todo_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE todoapp TO todo_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO todo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO todo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO todo_user;

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);

-- Insert sample data (optional)
INSERT INTO todos (text, completed) VALUES
    ('Learn Docker basics', true),
    ('Build a multi-container app', false),
    ('Implement health checks', false),
    ('Test with Docker Compose', false)
ON CONFLICT DO NOTHING;

-- Update the search path for the user
ALTER USER todo_user SET search_path TO public;

-- Print success message
\echo 'Database initialization complete!'
\echo 'Tables created: todos'
\echo 'Sample data inserted: 4 todos'
