const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get all action logs for a batch
router.get('/batch/:batchId', authMiddleware, async (req, res) => {
  try {
    const { batchId } = req.params;

    const { data, error } = await supabase
      .from('action_logs')
      .select('*, users(name, email)')
      .eq('batch_id', batchId)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all action logs for current user
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('action_logs')
      .select('*, batches(qr_code_value, varieties(name))')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create action log
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { batch_id, action_type, details } = req.body;
    const userId = req.user.id;

    if (!batch_id || !action_type) {
      return res.status(400).json({ error: 'batch_id and action_type required' });
    }

    const { data, error } = await supabase
      .from('action_logs')
      .insert({
        batch_id,
        user_id: userId,
        action_type,
        details: details || {},
        timestamp: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get action logs statistics (for reports)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('action_logs')
      .select('action_type, details, timestamp');

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;

    // Group by action type
    const stats = data.reduce((acc, log) => {
      acc[log.action_type] = (acc[log.action_type] || 0) + 1;
      return acc;
    }, {});

    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
