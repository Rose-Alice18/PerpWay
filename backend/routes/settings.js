const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Middleware to verify admin authentication
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'perpway-fallback-secret-key-2025');

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET settings (public for business hours/announcements, full data for admin)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    // If admin, return all settings
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'perpway-fallback-secret-key-2025');
        if (decoded.role === 'admin') {
          return res.json(settings);
        }
      } catch (error) {
        // Not admin, continue to public view
      }
    }

    // For public/non-admin: return only necessary info
    res.json({
      pricing: settings.pricing, // Make pricing public so delivery forms can use it
      businessHours: settings.businessHours,
      announcements: settings.announcements.filter(a => a.active &&
        (!a.endDate || new Date(a.endDate) >= new Date())),
      general: {
        platformName: settings.general.platformName,
        supportEmail: settings.general.supportEmail,
        supportPhone: settings.general.supportPhone,
        currency: settings.general.currency,
        maintenanceMode: settings.general.maintenanceMode,
        maintenanceMessage: settings.general.maintenanceMessage
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// UPDATE settings (admin only)
router.put('/', verifyAdmin, async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    // Update fields if provided
    if (req.body.pricing) settings.pricing = { ...settings.pricing, ...req.body.pricing };
    if (req.body.autoAssignment) settings.autoAssignment = { ...settings.autoAssignment, ...req.body.autoAssignment };
    if (req.body.notificationTemplates) settings.notificationTemplates = { ...settings.notificationTemplates, ...req.body.notificationTemplates };
    if (req.body.businessHours) settings.businessHours = { ...settings.businessHours, ...req.body.businessHours };
    if (req.body.sla) settings.sla = { ...settings.sla, ...req.body.sla };
    if (req.body.general) settings.general = { ...settings.general, ...req.body.general };

    settings.updatedBy = req.user.email || req.user.name;
    await settings.save();

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ADD announcement (admin only)
router.post('/announcements', verifyAdmin, async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    const newAnnouncement = {
      title: req.body.title,
      message: req.body.message,
      type: req.body.type || 'info',
      active: req.body.active !== undefined ? req.body.active : true,
      startDate: req.body.startDate || new Date(),
      endDate: req.body.endDate || null,
      targetAudience: req.body.targetAudience || 'all',
      createdBy: req.user.email || req.user.name
    };

    settings.announcements.push(newAnnouncement);
    await settings.save();

    res.json({ message: 'Announcement created successfully', announcement: newAnnouncement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// UPDATE announcement (admin only)
router.put('/announcements/:id', verifyAdmin, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    const announcement = settings.announcements.id(req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (req.body.title) announcement.title = req.body.title;
    if (req.body.message) announcement.message = req.body.message;
    if (req.body.type) announcement.type = req.body.type;
    if (req.body.active !== undefined) announcement.active = req.body.active;
    if (req.body.startDate) announcement.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) announcement.endDate = req.body.endDate;
    if (req.body.targetAudience) announcement.targetAudience = req.body.targetAudience;

    await settings.save();

    res.json({ message: 'Announcement updated successfully', announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// DELETE announcement (admin only)
router.delete('/announcements/:id', verifyAdmin, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.announcements.id(req.params.id).remove();
    await settings.save();

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// ADD holiday (admin only)
router.post('/holidays', verifyAdmin, async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    const newHoliday = {
      date: req.body.date,
      name: req.body.name,
      description: req.body.description || ''
    };

    settings.businessHours.holidays.push(newHoliday);
    await settings.save();

    res.json({ message: 'Holiday added successfully', holiday: newHoliday });
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({ error: 'Failed to add holiday' });
  }
});

// DELETE holiday (admin only)
router.delete('/holidays/:date', verifyAdmin, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.businessHours.holidays = settings.businessHours.holidays.filter(
      h => h.date !== req.params.date
    );
    await settings.save();

    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

module.exports = router;
