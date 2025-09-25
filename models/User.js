const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    sparse: true,
    match: [/^1[3-9]\d{9}$/, 'Please enter a valid phone number']
  },
  password_hash: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String,
    default: null
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    maxlength: 500
  },
  status: {
    type: Number,
    enum: [0, 1, 2], // 0-禁用，1-正常，2-待验证
    default: 1
  },
  user_type: {
    type: Number,
    enum: [1, 2, 3], // 1-普通用户，2-VIP用户，3-管理员
    default: 1
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  last_login_time: {
    type: Date,
    default: null
  },
  last_login_ip: {
    type: String,
    default: null
  },
  // 用户统计信息
  stats: {
    published_count: { type: Number, default: 0 },
    purchased_count: { type: Number, default: 0 },
    total_income: { type: Number, default: 0 },
    total_expense: { type: Number, default: 0 }
  },
  // 认证信息
  auth: {
    email_verified: { type: Boolean, default: false },
    phone_verified: { type: Boolean, default: false },
    verification_code: { type: String, default: null },
    verification_expires: { type: Date, default: null }
  }
}, {
  timestamps: {
    createdAt: 'created_time',
    updatedAt: 'updated_time'
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// 转换为JSON时的处理
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password_hash;
  delete user.auth.verification_code;
  return user;
};

// 虚拟字段：用户角色名称
userSchema.virtual('role_name').get(function() {
  const roleMap = { 1: 'user', 2: 'vip', 3: 'admin' };
  return roleMap[this.user_type] || 'user';
});

// 虚拟字段：是否为管理员
userSchema.virtual('is_admin').get(function() {
  return this.user_type === 3;
});

// 索引
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ status: 1 });
userSchema.index({ user_type: 1 });
userSchema.index({ created_time: -1 });

module.exports = mongoose.model('User', userSchema);