const express = require('express');
const router = express.Router();
const { listGroups, getStatus } = require('../services/whatsapp');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET WhatsApp connection status
router.get('/status', authenticateToken, requireAdmin, (req, res) => {
  res.json(getStatus());
});

// GET all groups the WhatsApp number is in (to find group IDs)
router.get('/groups', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const groups = await listGroups();
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups', message: err.message });
  }
});

module.exports = router;
