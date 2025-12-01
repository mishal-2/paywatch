const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// Simulate payment processing delay
const simulateProcessing = () => {
  return new Promise(resolve => {
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    setTimeout(resolve, delay);
  });
};

// @route   POST /api/payments/initiate
// @desc    Initiate payment transaction
// @access  Private
router.post('/initiate', protect, async (req, res) => {
  try {
    const { amount, merchantName, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Simulate payment processing
    await simulateProcessing();

    // Random success/failure (95% success rate)
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed. Please try again.',
        paymentStatus: 'failed'
      });
    }

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      paymentStatus: 'processing',
      paymentId: 'PAY' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initiating payment',
      error: error.message
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle payment gateway webhooks
// @access  Public (in production, verify webhook signature)
router.post('/webhook', async (req, res) => {
  try {
    const { transactionId, status, amount } = req.body;

    // Find and update transaction
    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction.status = status;
    await transaction.save();

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

// @route   GET /api/payments/:id/status
// @desc    Check payment status
// @access  Private
router.get('/:id/status', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      transactionId: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      paymentStatus: transaction.status,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
});

module.exports = router;
