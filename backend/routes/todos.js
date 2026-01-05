const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;

// Get all todos
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM todos ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

// Get single todo
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM todos WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// Create new todo
router.post('/', async (req, res, next) => {
    try {
        const { text, completed = false } = req.body;
        
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Valid text is required' });
        }

        const result = await pool.query(
            `INSERT INTO todos (text, completed) 
             VALUES ($1, $2) 
             RETURNING *`,
            [text, completed]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// Update todo
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text, completed } = req.body;
        
        // Check if todo exists
        const checkResult = await pool.query(
            'SELECT * FROM todos WHERE id = $1',
            [id]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (text !== undefined) {
            updates.push(`text = $${paramCount}`);
            values.push(text);
            paramCount++;
        }

        if (completed !== undefined) {
            updates.push(`completed = $${paramCount}`);
            values.push(completed);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE todos 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount} 
            RETURNING *
        `;

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// Delete todo
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM todos WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
