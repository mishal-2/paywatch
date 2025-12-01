const express = require('express');
const router = express.Router();
const axios = require('axios');
const Transaction = require('../models/Transaction');
const FlaggedAlert = require('../models/FlaggedAlert');
const { protect } = require('../middleware/auth');

// @route   POST /api/transactions
// @desc    Create and analyze transaction
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { amount, merchantName, merchantCategory, paymentMethod } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // Prepare data for ML model
    const mlData = {
      Amount: parseFloat(amount),
      Time: Math.floor(Date.now() / 1000)
    };

    // Call ML service for fraud prediction
    let fraudPrediction = 0;
    let fraudScore = 0;

    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/predict`,
        mlData
      );
      fraudPrediction = mlResponse.data.prediction;
      fraudScore = mlResponse.data.fraud_score || (fraudPrediction === 1 ? 0.85 : 0.15);
    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
      // Continue with default values if ML service is down
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      amount,
      time: mlData.Time,
      merchantName,
      merchantCategory,
      paymentMethod,
      fraudPrediction,
      fraudScore,
      status: fraudPrediction === 1 ? 'flagged' : 'approved',
      requiresTwoFactor: fraudPrediction === 1
    });

    // If fraud detected, create alert
    if (fraudPrediction === 1) {
      await FlaggedAlert.create({
        transaction: transaction._id,
        user: req.user.id,
        alertType: 'ml_detected',
        severity: fraudScore > 0.8 ? 'critical' : fraudScore > 0.6 ? 'high' : 'medium',
        fraudScore,
        reason: `ML model detected suspicious transaction pattern. Fraud score: ${(fraudScore * 100).toFixed(2)}%`
      });
    }

    res.status(201).json({
      success: true,
      message: fraudPrediction === 1 ? 'Transaction flagged for review' : 'Transaction approved',
      transaction,
      requiresTwoFactor: fraudPrediction === 1
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing transaction',
      error: error.message
    });
  }
});

// @route   GET /api/transactions
// @desc    Get all user transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, fraudPrediction, limit = 50, page = 1 } = req.query;

    const query = { user: req.user.id };
    
    if (status) query.status = status;
    if (fraudPrediction !== undefined) query.fraudPrediction = parseInt(fraudPrediction);

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

// @route   GET /api/transactions/flagged
// @desc    Get flagged transactions
// @access  Private
router.get('/flagged', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
      fraudPrediction: 1
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching flagged transactions',
      error: error.message
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
});

module.exports = router;
