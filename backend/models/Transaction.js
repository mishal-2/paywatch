const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  time: {
    type: Number,
    required: true,
    default: () => Math.floor(Date.now() / 1000)
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  merchantName: {
    type: String,
    trim: true
  },
  merchantCategory: {
    type: String,
    trim: true
  },
  location: {
    country: String,
    city: String,
    ipAddress: String
  },
  deviceInfo: {
    type: String,
    browser: String,
    os: String
  },
  fraudPrediction: {
    type: Number,
    enum: [0, 1],
    required: true
  },
  fraudScore: {
    type: Number,
    min: 0,
    max: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged', 'verified'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'],
    default: 'credit_card'
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  requiresTwoFactor: {
    type: Boolean,
    default: false
  },
  twoFactorVerified: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ fraudPrediction: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionId: 1 });

// Generate unique transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
