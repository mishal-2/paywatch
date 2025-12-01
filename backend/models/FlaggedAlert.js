const mongoose = require('mongoose');

const flaggedAlertSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alertType: {
    type: String,
    enum: ['high_amount', 'unusual_location', 'rapid_transactions', 'suspicious_pattern', 'ml_detected'],
    default: 'ml_detected'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  fraudScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'false_positive'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  resolution: {
    type: String
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
flaggedAlertSchema.index({ user: 1, createdAt: -1 });
flaggedAlertSchema.index({ status: 1 });
flaggedAlertSchema.index({ severity: 1 });

module.exports = mongoose.model('FlaggedAlert', flaggedAlertSchema);
