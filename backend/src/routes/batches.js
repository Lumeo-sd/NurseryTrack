const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

// Get all batches
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, v.name as variety_name, v.latin_name
       FROM batches b
       LEFT JOIN varieties v ON b.variety_id = v.id
       ORDER BY b.date_added DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get batch by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT b.*, v.name as variety_name, v.latin_name
       FROM batches b
       LEFT JOIN varieties v ON b.variety_id = v.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Get photos for this batch
    const photosResult = await pool.query(
      'SELECT * FROM photos WHERE batch_id = $1 ORDER BY uploaded_at DESC',
      [id]
    );

    // Get action logs for this batch
    const logsResult = await pool.query(
      `SELECT al.*, u.email, u.name
       FROM action_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.batch_id = $1
       ORDER BY al.timestamp DESC`,
      [id]
    );

    res.json({
      ...result.rows[0],
      photos: photosResult.rows,
      actionLogs: logsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create new batch
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { variety_id, quantity, container_size, location, notes } = req.body;
    const batch_id = uuidv4();
    const qr_code_value = batch_id;

    const result = await pool.query(
      `INSERT INTO batches
       (id, variety_id, quantity, container_size, location, notes, qr_code_value, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'укорінення')
       RETURNING *`,
      [batch_id, variety_id, quantity, container_size, location, notes, qr_code_value]
    );

    // Log action
    await pool.query(
      `INSERT INTO action_logs (id, batch_id, user_id, action_type, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), batch_id, req.userId, 'CREATE', JSON.stringify({ quantity })]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update batch
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, status, container_size, location, notes, price, date_rooted } = req.body;

    const result = await pool.query(
      `UPDATE batches
       SET quantity = COALESCE($1, quantity),
           status = COALESCE($2, status),
           container_size = COALESCE($3, container_size),
           location = COALESCE($4, location),
           notes = COALESCE($5, notes),
           price = COALESCE($6, price),
           date_rooted = COALESCE($7, date_rooted)
       WHERE id = $8
       RETURNING *`,
      [quantity, status, container_size, location, notes, price, date_rooted, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Log action
    await pool.query(
      `INSERT INTO action_logs (id, batch_id, user_id, action_type, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), id, req.userId, 'UPDATE', JSON.stringify(req.body)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete batch
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );

    if (userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete batches' });
    }

    const result = await pool.query(
      'DELETE FROM batches WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Log action
    await pool.query(
      `INSERT INTO action_logs (id, batch_id, user_id, action_type, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), id, req.userId, 'DELETE', JSON.stringify({ batchId: id })]
    );

    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get batches by status
router.get('/status/:status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.params;
    const result = await pool.query(
      `SELECT b.*, v.name as variety_name, v.latin_name
       FROM batches b
       LEFT JOIN varieties v ON b.variety_id = v.id
       WHERE b.status = $1
       ORDER BY b.date_added DESC`,
      [status]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
