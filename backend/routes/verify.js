const express = require('express');
const router = express.Router();
const OTP = require('../models/OTP');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/emailService');
const { generateOTP } = require('../utils/otpGenerator');

// @route   POST /api/verify/send-otp
// @desc    Send OTP for transaction verification
// @access  Private
router.post('/send-otp', protect, async (req, res) => {
  try {
    const { transactionId } = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({
      transactionId,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (!transaction.requiresTwoFactor) {
      return res.status(400).json({
        success: false,
        message: 'This transaction does not require 2FA'
      });
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Save OTP to database
    await OTP.create({
      user: req.user.id,
      transaction: transaction._id,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Send OTP via email
    try {
      await sendOTPEmail(req.user.email, otpCode, transaction);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Continue even if email fails (for development)
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: '5 minutes',
      // In development, return OTP (remove in production)
      ...(process.env.NODE_ENV === 'development' && { otp: otpCode })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
});

// @route   POST /api/verify/verify-otp
// @desc    Verify OTP and approve transaction
// @access  Private
router.post('/verify-otp', protect, async (req, res) => {
  try {
    const { transactionId, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    // Find transaction
    const transaction = await Transaction.findOne({
      transactionId,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      user: req.user.id,
      transaction: transaction._id,
      verified: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: 'No OTP found for this transaction'
      });
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: 3 - otpRecord.attempts
      });
    }

    // OTP is valid - mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Update transaction
    transaction.twoFactorVerified = true;
    transaction.status = 'verified';
    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction verified successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
});

// @route   POST /api/verify/resend-otp
// @desc    Resend OTP
// @access  Private
router.post('/resend-otp', protect, async (req, res) => {
  try {
    const { transactionId } = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({
      transactionId,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();

    // Invalidate old OTPs
    await OTP.updateMany(
      { user: req.user.id, transaction: transaction._id, verified: false },
      { expiresAt: new Date() }
    );

    // Create new OTP
    await OTP.create({
      user: req.user.id,
      transaction: transaction._id,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // Send OTP via email
    try {
      await sendOTPEmail(req.user.email, otpCode, transaction);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      // In development, return OTP (remove in production)
      ...(process.env.NODE_ENV === 'development' && { otp: otpCode })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
});

module.exports = router;
