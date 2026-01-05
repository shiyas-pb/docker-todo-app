const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'todoapp',
    user: process.env.DB_USER || 'todo_user',
    password: process.env.DB_PASSWORD || 'todo_password',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
async function connectDB() {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');
        
        // Initialize database schema if needed
        await migrate();
        
        client.release();
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
}

// Database migration/initialization
async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                text VARCHAR(500) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
            CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
        `);
        console.log('Database schema initialized');
    } catch (error) {
        console.error('Migration failed:', error.message);
        throw error;
    }
}

// Health check function
async function checkDBHealth() {
    try {
        const result = await pool.query('SELECT 1 as health_check');
        return result.rows[0] ? 'connected' : 'error';
    } catch (error) {
        console.error('Database health check failed:', error.message);
        return 'disconnected';
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Closing database pool...');
    await pool.end();
    console.log('Database pool closed');
});

module.exports = {
    pool,
    connectDB,
    migrate,
    checkDBHealth
};
