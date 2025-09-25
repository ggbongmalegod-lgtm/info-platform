const mongoose = require('mongoose');

const informationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['business', 'investment', 'technology', 'education', 'lifestyle', 'other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  purchases: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  images: [{
    type: String
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  content: {
    type: String,
    required: true
  },
  previewContent: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

informationSchema.index({ seller: 1 });
informationSchema.index({ category: 1 });
informationSchema.index({ tags: 1 });
informationSchema.index({ price: 1 });
informationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Information', informationSchema);