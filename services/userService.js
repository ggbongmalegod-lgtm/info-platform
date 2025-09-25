const User = require('../models/User');
const Trade = require('../models/Trade');
const Information = require('../models/Information');

class UserService {
  static async getUserStats(userId) {
    const [user, purchaseCount, salesCount, publishedCount] = await Promise.all([
      User.findById(userId).select('-password -resetPasswordCode -verificationCode'),
      Trade.countDocuments({ buyer: userId, status: 'completed' }),
      Trade.countDocuments({ seller: userId, status: 'completed' }),
      Information.countDocuments({ seller: userId, isActive: true })
    ]);

    return {
      user,
      stats: {
        purchaseCount,
        salesCount,
        publishedCount,
        totalEarnings: user.totalEarnings,
        totalSpent: user.totalSpent,
        balance: user.balance,
        rating: user.rating
      }
    };
  }

  static async updateUserBalance(userId, amount, operation = 'add') {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (operation === 'add') {
      user.balance += amount;
    } else if (operation === 'subtract') {
      if (user.balance < amount) {
        throw new Error('余额不足');
      }
      user.balance -= amount;
    }

    await user.save();
    return user.balance;
  }

  static async verifyUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    return user;
  }

  static async deactivateUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    user.isActive = false;
    await user.save();

    await Information.updateMany(
      { seller: userId },
      { isActive: false }
    );

    return user;
  }

  static async searchUsers(query, options = {}) {
    const {
      page = 1,
      limit = 20,
      role,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const filter = {
      isActive: true,
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    if (role) {
      filter.role = role;
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordCode -verificationCode')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = UserService;