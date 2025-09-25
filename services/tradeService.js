const Trade = require('../models/Trade');
const Information = require('../models/Information');
const User = require('../models/User');
const config = require('../config/config');

class TradeService {
  static async createTrade(buyerId, sellerId, informationId, amount, message) {
    const buyer = await User.findById(buyerId);
    const seller = await User.findById(sellerId);
    const information = await Information.findById(informationId);

    if (!buyer || !seller || !information) {
      throw new Error('买家、卖家或信息不存在');
    }

    if (buyer.balance < amount) {
      throw new Error('余额不足');
    }

    const commission = amount * config.trade.commissionRate;

    const trade = new Trade({
      buyer: buyerId,
      seller: sellerId,
      information: informationId,
      amount,
      commission,
      buyerMessage: message,
      status: 'pending'
    });

    buyer.balance -= amount;
    buyer.totalSpent += amount;

    await Promise.all([
      trade.save(),
      buyer.save()
    ]);

    return trade;
  }

  static async completeTrade(tradeId) {
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      throw new Error('交易不存在');
    }

    if (trade.status !== 'pending') {
      throw new Error('交易状态不正确');
    }

    const seller = await User.findById(trade.seller);
    const sellerEarnings = trade.amount - trade.commission;

    seller.balance += sellerEarnings;
    seller.totalEarnings += sellerEarnings;

    trade.status = 'completed';
    trade.completedAt = new Date();

    await Promise.all([
      trade.save(),
      seller.save(),
      Information.findByIdAndUpdate(trade.information, {
        $inc: { purchases: 1 }
      })
    ]);

    return trade;
  }

  static async cancelTrade(tradeId, reason) {
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      throw new Error('交易不存在');
    }

    if (trade.status !== 'pending') {
      throw new Error('只能取消待处理的交易');
    }

    const buyer = await User.findById(trade.buyer);
    buyer.balance += trade.amount;
    buyer.totalSpent -= trade.amount;

    trade.status = 'cancelled';
    trade.refundReason = reason;
    trade.refundAmount = trade.amount;
    trade.refundedAt = new Date();

    await Promise.all([
      trade.save(),
      buyer.save()
    ]);

    return trade;
  }

  static async processRefund(tradeId, reason) {
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      throw new Error('交易不存在');
    }

    if (trade.status !== 'completed') {
      throw new Error('只有已完成的交易可以退款');
    }

    const hoursSincePurchase = (new Date() - trade.completedAt) / (1000 * 60 * 60);
    const daysSincePurchase = hoursSincePurchase / 24;

    let refundAmount = 0;
    if (hoursSincePurchase <= config.trade.refundPolicy.fullRefundHours) {
      refundAmount = trade.amount;
    } else if (daysSincePurchase <= config.trade.refundPolicy.partialRefundDays) {
      refundAmount = trade.amount * 0.5;
    } else {
      throw new Error('超出退款期限');
    }

    const [buyer, seller] = await Promise.all([
      User.findById(trade.buyer),
      User.findById(trade.seller)
    ]);

    buyer.balance += refundAmount;
    buyer.totalSpent -= refundAmount;

    const sellerDeduction = refundAmount - trade.commission;
    if (seller.balance >= sellerDeduction) {
      seller.balance -= sellerDeduction;
      seller.totalEarnings -= sellerDeduction;
    } else {
      seller.balance = 0;
      seller.totalEarnings = Math.max(0, seller.totalEarnings - sellerDeduction);
    }

    trade.status = 'refunded';
    trade.refundReason = reason;
    trade.refundAmount = refundAmount;
    trade.refundedAt = new Date();

    await Promise.all([
      trade.save(),
      buyer.save(),
      seller.save()
    ]);

    return {
      trade,
      refundAmount,
      buyerNewBalance: buyer.balance
    };
  }

  static async addRating(tradeId, userId, rating, comment) {
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      throw new Error('交易不存在');
    }

    if (trade.status !== 'completed') {
      throw new Error('只有已完成的交易可以评分');
    }

    const isBuyer = trade.buyer.toString() === userId;
    const isSeller = trade.seller.toString() === userId;

    if (!isBuyer && !isSeller) {
      throw new Error('无权对此交易评分');
    }

    if (isBuyer) {
      if (trade.rating.buyerRating) {
        throw new Error('买家已经评分过了');
      }
      trade.rating.buyerRating = rating;
      trade.rating.buyerComment = comment;
    } else {
      if (trade.rating.sellerRating) {
        throw new Error('卖家已经评分过了');
      }
      trade.rating.sellerRating = rating;
      trade.rating.sellerComment = comment;
    }

    await trade.save();

    const targetUserId = isBuyer ? trade.seller : trade.buyer;
    await this.updateUserRating(targetUserId);

    return trade;
  }

  static async updateUserRating(userId) {
    const userTrades = await Trade.find({
      $or: [
        { buyer: userId, 'rating.sellerRating': { $exists: true } },
        { seller: userId, 'rating.buyerRating': { $exists: true } }
      ]
    });

    const ratings = [];
    userTrades.forEach(trade => {
      if (trade.buyer.toString() === userId.toString() && trade.rating.sellerRating) {
        ratings.push(trade.rating.sellerRating);
      }
      if (trade.seller.toString() === userId.toString() && trade.rating.buyerRating) {
        ratings.push(trade.rating.buyerRating);
      }
    });

    if (ratings.length > 0) {
      const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      await User.findByIdAndUpdate(userId, {
        'rating.average': Math.round(averageRating * 10) / 10,
        'rating.count': ratings.length
      });
    }
  }

  static async getTradeStatistics(userId, role = 'both') {
    const matchConditions = [];

    if (role === 'buyer' || role === 'both') {
      matchConditions.push({ buyer: userId });
    }

    if (role === 'seller' || role === 'both') {
      matchConditions.push({ seller: userId });
    }

    const stats = await Trade.aggregate([
      {
        $match: {
          $or: matchConditions,
          status: { $in: ['completed', 'refunded'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const result = {
      totalTrades: 0,
      completedTrades: 0,
      refundedTrades: 0,
      totalAmount: 0,
      refundedAmount: 0
    };

    stats.forEach(stat => {
      if (stat._id === 'completed') {
        result.completedTrades = stat.count;
        result.totalAmount = stat.totalAmount;
      } else if (stat._id === 'refunded') {
        result.refundedTrades = stat.count;
        result.refundedAmount = stat.totalAmount;
      }
    });

    result.totalTrades = result.completedTrades + result.refundedTrades;

    return result;
  }

  static async getRecentTrades(userId, limit = 10) {
    return await Trade.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
    .populate('buyer', 'username avatar')
    .populate('seller', 'username avatar')
    .populate('information', 'title price category')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  }
}

module.exports = TradeService;