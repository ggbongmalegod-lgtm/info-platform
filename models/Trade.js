const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  information: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Information',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  commission: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded', 'disputed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['balance', 'alipay', 'wechat', 'bank'],
    default: 'balance'
  },
  buyerMessage: {
    type: String,
    maxlength: 500
  },
  sellerResponse: {
    type: String,
    maxlength: 500
  },
  refundReason: {
    type: String,
    maxlength: 500
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  rating: {
    buyerRating: { type: Number, min: 1, max: 5 },
    sellerRating: { type: Number, min: 1, max: 5 },
    buyerComment: String,
    sellerComment: String
  },
  completedAt: Date,
  refundedAt: Date
}, {
  timestamps: true
});

tradeSchema.index({ buyer: 1 });
tradeSchema.index({ seller: 1 });
tradeSchema.index({ information: 1 });
tradeSchema.index({ status: 1 });
tradeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Trade', tradeSchema);