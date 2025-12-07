const express = require('express');
const router = express.Router();
const DeliveryRequest = require('../models/DeliveryRequest');

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

// GET revenue overview
router.get('/overview', verifyAdmin, async (req, res) => {
  try {
    const { period = 'today' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch(period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    // Get all deliveries in the period
    const deliveries = await DeliveryRequest.find({
      createdAt: { $gte: startDate }
    });

    // Calculate totals
    const totalRevenue = deliveries.reduce((sum, d) => sum + (d.price || 0), 0);
    const paidRevenue = deliveries
      .filter(d => d.paymentStatus === 'paid')
      .reduce((sum, d) => sum + (d.price || 0), 0);
    const unpaidRevenue = deliveries
      .filter(d => d.paymentStatus === 'unpaid')
      .reduce((sum, d) => sum + (d.price || 0), 0);
    const totalCommissions = deliveries.reduce((sum, d) => sum + (d.riderCommission || 0), 0);
    const platformRevenue = deliveries.reduce((sum, d) => sum + (d.platformRevenue || 0), 0);

    // Count deliveries by status
    const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;
    const pendingCount = deliveries.filter(d => d.status === 'pending').length;
    const inProgressCount = deliveries.filter(d => ['assigned', 'in-progress'].includes(d.status)).length;

    // Revenue by delivery type
    const revenueByType = {
      instant: deliveries
        .filter(d => d.deliveryType === 'instant')
        .reduce((sum, d) => sum + (d.price || 0), 0),
      nextDay: deliveries
        .filter(d => d.deliveryType === 'next-day')
        .reduce((sum, d) => sum + (d.price || 0), 0),
      weeklyStation: deliveries
        .filter(d => d.deliveryType === 'weekly-station')
        .reduce((sum, d) => sum + (d.price || 0), 0),
    };

    // Revenue by payment status
    const revenueByPaymentStatus = {
      paid: paidRevenue,
      unpaid: unpaidRevenue,
      refunded: deliveries
        .filter(d => d.paymentStatus === 'refunded')
        .reduce((sum, d) => sum + (d.price || 0), 0),
    };

    res.json({
      period,
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      totalCommissions,
      platformRevenue,
      profitMargin: totalRevenue > 0 ? ((platformRevenue / totalRevenue) * 100).toFixed(2) : 0,
      deliveryStats: {
        total: deliveries.length,
        delivered: deliveredCount,
        pending: pendingCount,
        inProgress: inProgressCount,
      },
      revenueByType,
      revenueByPaymentStatus,
      averageOrderValue: deliveries.length > 0 ? (totalRevenue / deliveries.length).toFixed(2) : 0,
    });
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    res.status(500).json({ error: 'Failed to fetch financial overview' });
  }
});

// GET revenue by rider
router.get('/riders', verifyAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate = new Date();

    switch(period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Aggregate deliveries by rider
    const riderStats = await DeliveryRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          assignedRider: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$assignedRider',
          riderName: { $first: '$assignedRiderName' },
          totalDeliveries: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
          totalCommission: { $sum: '$riderCommission' },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          paidRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$price', 0] }
          },
          unpaidRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, '$price', 0] }
          },
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.json({
      period,
      riders: riderStats.map(r => ({
        riderId: r._id,
        riderName: r.riderName || 'Unknown Rider',
        totalDeliveries: r.totalDeliveries,
        deliveredCount: r.deliveredCount,
        totalRevenue: r.totalRevenue,
        totalCommission: r.totalCommission,
        paidRevenue: r.paidRevenue,
        unpaidRevenue: r.unpaidRevenue,
        averageOrderValue: (r.totalRevenue / r.totalDeliveries).toFixed(2),
        completionRate: ((r.deliveredCount / r.totalDeliveries) * 100).toFixed(2),
      }))
    });
  } catch (error) {
    console.error('Error fetching rider financials:', error);
    res.status(500).json({ error: 'Failed to fetch rider financials' });
  }
});

// GET daily revenue trend
router.get('/trends', verifyAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const dailyStats = await DeliveryRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalRevenue: { $sum: '$price' },
          totalCommissions: { $sum: '$riderCommission' },
          platformRevenue: { $sum: '$platformRevenue' },
          deliveryCount: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      days: parseInt(days),
      trends: dailyStats.map(stat => ({
        date: stat._id,
        totalRevenue: stat.totalRevenue,
        totalCommissions: stat.totalCommissions,
        platformRevenue: stat.platformRevenue,
        deliveryCount: stat.deliveryCount,
        paidCount: stat.paidCount,
        averageOrderValue: (stat.totalRevenue / stat.deliveryCount).toFixed(2),
      }))
    });
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    res.status(500).json({ error: 'Failed to fetch revenue trends' });
  }
});

// UPDATE delivery payment status
router.put('/deliveries/:id/payment', verifyAdmin, async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const delivery = await DeliveryRequest.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    delivery.paymentStatus = paymentStatus;
    if (paymentMethod) {
      delivery.paymentMethod = paymentMethod;
    }
    if (paymentStatus === 'paid' && !delivery.paidAt) {
      delivery.paidAt = new Date();
    }

    await delivery.save();

    res.json({
      message: 'Payment status updated successfully',
      delivery
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

module.exports = router;
