const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const FlaggedAlert = require('../models/FlaggedAlert');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/overview
// @desc    Get overall statistics
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Total transactions
    const totalTransactions = await Transaction.countDocuments({ user: userId });

    // Fraud detected
    const fraudDetected = await Transaction.countDocuments({ 
      user: userId, 
      fraudPrediction: 1 
    });

    // Calculate fraud rate
    const fraudRate = totalTransactions > 0 
      ? ((fraudDetected / totalTransactions) * 100).toFixed(2) 
      : 0;

    // Amount saved (sum of flagged transaction amounts)
    const flaggedTransactions = await Transaction.find({ 
      user: userId, 
      fraudPrediction: 1 
    });
    const amountSaved = flaggedTransactions.reduce((sum, txn) => sum + txn.amount, 0);

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Pending alerts
    const pendingAlerts = await FlaggedAlert.countDocuments({ 
      user: userId, 
      status: 'pending' 
    });

    res.json({
      success: true,
      data: {
        totalTransactions,
        fraudDetected,
        fraudRate: parseFloat(fraudRate),
        amountSaved: parseFloat(amountSaved.toFixed(2)),
        legitimateTransactions: totalTransactions - fraudDetected,
        pendingAlerts,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/fraud-trends
// @desc    Get fraud trends over time
// @access  Private
router.get('/fraud-trends', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const userId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const transactions = await Transaction.find({
      user: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group by date
    const trendData = {};
    transactions.forEach(txn => {
      const date = txn.createdAt.toISOString().split('T')[0];
      if (!trendData[date]) {
        trendData[date] = { date, total: 0, fraud: 0, legitimate: 0 };
      }
      trendData[date].total++;
      if (txn.fraudPrediction === 1) {
        trendData[date].fraud++;
      } else {
        trendData[date].legitimate++;
      }
    });

    const trends = Object.values(trendData);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fraud trends',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/risk-distribution
// @desc    Get risk score distribution
// @access  Private
router.get('/risk-distribution', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ user: userId });

    const distribution = {
      low: 0,      // 0-0.3
      medium: 0,   // 0.3-0.6
      high: 0,     // 0.6-0.8
      critical: 0  // 0.8-1.0
    };

    transactions.forEach(txn => {
      const score = txn.fraudScore || 0;
      if (score < 0.3) distribution.low++;
      else if (score < 0.6) distribution.medium++;
      else if (score < 0.8) distribution.high++;
      else distribution.critical++;
    });

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching risk distribution',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/recent-alerts
// @desc    Get recent flagged alerts
// @access  Private
router.get('/recent-alerts', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const alerts = await FlaggedAlert.find({ user: userId })
      .populate('transaction')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get model performance metrics
// @access  Private
router.get('/performance', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTransactions = await Transaction.countDocuments({ user: userId });
    const fraudDetected = await Transaction.countDocuments({ 
      user: userId, 
      fraudPrediction: 1 
    });

    // Calculate average fraud score
    const transactions = await Transaction.find({ user: userId });
    const avgFraudScore = transactions.length > 0
      ? transactions.reduce((sum, txn) => sum + (txn.fraudScore || 0), 0) / transactions.length
      : 0;

    res.json({
      success: true,
      data: {
        totalTransactions,
        fraudDetected,
        accuracy: '95.8%', // Placeholder - would come from model evaluation
        precision: '92.3%', // Placeholder
        recall: '89.7%', // Placeholder
        avgFraudScore: parseFloat(avgFraudScore.toFixed(4))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching performance metrics',
      error: error.message
    });
  }
});

module.exports = router;
