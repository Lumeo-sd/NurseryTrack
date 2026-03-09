const express = require('express');
const router = express.Router();
const pool = require('../db/postgres');
const auth = require('../middleware/auth');

// Отримати всі сорти
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM varieties ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Отримати один сорт
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM varieties WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variety not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Створити новий сорт (тільки адміни)
router.post('/', auth, async (req, res) => {
  try {
    const { name, latin_name, default_photo_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      'INSERT INTO varieties (name, latin_name, default_photo_url) VALUES ($1, $2, $3) RETURNING *',
      [name, latin_name || null, default_photo_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Оновити сорт (тільки адміни)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, latin_name, default_photo_url } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE varieties SET name = COALESCE($1, name), latin_name = COALESCE($2, latin_name), default_photo_url = COALESCE($3, default_photo_url) WHERE id = $4 RETURNING *',
      [name || null, latin_name || null, default_photo_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variety not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Видалити сорт (тільки адміни)
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM varieties WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variety not found' });
    }

    res.json({ message: 'Variety deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
