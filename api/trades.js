const express = require('express');
const Trade = require('../models/Trade');
const Information = require('../models/Information');
const User = require('../models/User');
const ApiResponse = require('../utils/response');
const { validate, validationSchemas } = require('../utils/validation');
const config = require('../config/config');

const router = express.Router();

router.post('/purchase', validate(validationSchemas.trade), async (req, res) => {
  try {
    const { informationId, message } = req.body;

    const information = await Information.findById(informationId);
    if (!information || !information.isActive) {
      return res.status(404).json(
        ApiResponse.error('信息不存在或已下架', 404)
      );
    }

    if (information.seller.toString() === req.user.userId) {
      return res.status(400).json(
        ApiResponse.error('不能购买自己发布的信息', 400)
      );
    }

    const existingTrade = await Trade.findOne({
      buyer: req.user.userId,
      information: informationId,
      status: { $in: ['completed', 'pending'] }
    });

    if (existingTrade) {
      return res.status(409).json(
        ApiResponse.error('您已购买过此信息或有待处理的订单', 409)
      );
    }

    const buyer = await User.findById(req.user.userId);
    if (buyer.balance < information.price) {
      return res.status(400).json(
        ApiResponse.error('余额不足，请先充值', 400)
      );
    }

    const commission = information.price * config.trade.commissionRate;

    const trade = new Trade({
      buyer: req.user.userId,
      seller: information.seller,
      information: informationId,
      amount: information.price,
      commission,
      buyerMessage: message
    });

    buyer.balance -= information.price;
    buyer.totalSpent += information.price;

    await Promise.all([
      trade.save(),
      buyer.save(),
      Information.findByIdAndUpdate(informationId, {
        $inc: { purchases: 1 }
      })
    ]);

    await Trade.findByIdAndUpdate(trade._id, {
      status: 'completed',
      completedAt: new Date()
    });

    const seller = await User.findById(information.seller);
    const sellerEarnings = information.price - commission;
    seller.balance += sellerEarnings;
    seller.totalEarnings += sellerEarnings;
    await seller.save();

    const populatedTrade = await Trade.findById(trade._id)
      .populate('buyer', 'username avatar')
      .populate('seller', 'username avatar')
      .populate('information', 'title price')
      .lean();

    res.status(201).json(
      ApiResponse.success(populatedTrade, '购买成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('购买失败', 500, error.message)
    );
  }
});

router.get('/my-purchases', async (req, res) => {
  try {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      status
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { buyer: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const [trades, total] = await Promise.all([
      Trade.find(filter)
        .populate('seller', 'username avatar rating')
        .populate('information', 'title description price category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Trade.countDocuments(filter)
    ]);

    res.json(
      ApiResponse.paginated(trades, {
        page: pageNum,
        limit: limitNum,
        total
      })
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取购买记录失败', 500, error.message)
    );
  }
});

router.get('/my-sales', async (req, res) => {
  try {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      status
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { seller: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const [trades, total] = await Promise.all([
      Trade.find(filter)
        .populate('buyer', 'username avatar rating')
        .populate('information', 'title description price category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Trade.countDocuments(filter)
    ]);

    res.json(
      ApiResponse.paginated(trades, {
        page: pageNum,
        limit: limitNum,
        total
      })
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取销售记录失败', 500, error.message)
    );
  }
});

router.get('/:id', async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('buyer', 'username avatar rating')
      .populate('seller', 'username avatar rating')
      .populate('information', 'title description price category content')
      .lean();

    if (!trade) {
      return res.status(404).json(
        ApiResponse.error('交易记录不存在', 404)
      );
    }

    if (trade.buyer._id.toString() !== req.user.userId &&
        trade.seller._id.toString() !== req.user.userId) {
      return res.status(403).json(
        ApiResponse.error('无权查看此交易记录', 403)
      );
    }

    res.json(
      ApiResponse.success(trade, '获取交易详情成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取交易详情失败', 500, error.message)
    );
  }
});

router.post('/:id/refund', async (req, res) => {
  try {
    const { reason } = req.body;

    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json(
        ApiResponse.error('交易记录不存在', 404)
      );
    }

    if (trade.buyer.toString() !== req.user.userId) {
      return res.status(403).json(
        ApiResponse.error('只有买家可以申请退款', 403)
      );
    }

    if (trade.status !== 'completed') {
      return res.status(400).json(
        ApiResponse.error('只有已完成的交易可以申请退款', 400)
      );
    }

    const hoursSincePurchase = (new Date() - trade.completedAt) / (1000 * 60 * 60);
    const daysSincePurchase = hoursSincePurchase / 24;

    let refundAmount = 0;
    if (hoursSincePurchase <= config.trade.refundPolicy.fullRefundHours) {
      refundAmount = trade.amount;
    } else if (daysSincePurchase <= config.trade.refundPolicy.partialRefundDays) {
      refundAmount = trade.amount * 0.5;
    } else {
      return res.status(400).json(
        ApiResponse.error('超出退款期限', 400)
      );
    }

    trade.status = 'refunded';
    trade.refundReason = reason;
    trade.refundAmount = refundAmount;
    trade.refundedAt = new Date();

    const [buyer, seller] = await Promise.all([
      User.findById(trade.buyer),
      User.findById(trade.seller)
    ]);

    buyer.balance += refundAmount;
    buyer.totalSpent -= refundAmount;

    const sellerDeduction = refundAmount - trade.commission;
    seller.balance -= sellerDeduction;
    seller.totalEarnings -= sellerDeduction;

    await Promise.all([
      trade.save(),
      buyer.save(),
      seller.save()
    ]);

    res.json(
      ApiResponse.success({
        refundAmount,
        newBalance: buyer.balance
      }, '退款成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('退款失败', 500, error.message)
    );
  }
});

router.post('/:id/rate', async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json(
        ApiResponse.error('评分必须在1-5之间', 400)
      );
    }

    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json(
        ApiResponse.error('交易记录不存在', 404)
      );
    }

    if (trade.status !== 'completed') {
      return res.status(400).json(
        ApiResponse.error('只有已完成的交易可以评分', 400)
      );
    }

    const isBuyer = trade.buyer.toString() === req.user.userId;
    const isSeller = trade.seller.toString() === req.user.userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json(
        ApiResponse.error('无权对此交易评分', 403)
      );
    }

    if (isBuyer) {
      if (trade.rating.buyerRating) {
        return res.status(400).json(
          ApiResponse.error('您已经评分过了', 400)
        );
      }
      trade.rating.buyerRating = rating;
      trade.rating.buyerComment = comment;
    } else {
      if (trade.rating.sellerRating) {
        return res.status(400).json(
          ApiResponse.error('您已经评分过了', 400)
        );
      }
      trade.rating.sellerRating = rating;
      trade.rating.sellerComment = comment;
    }

    await trade.save();

    const targetUserId = isBuyer ? trade.seller : trade.buyer;
    const userTrades = await Trade.find({
      $or: [
        { buyer: targetUserId, 'rating.sellerRating': { $exists: true } },
        { seller: targetUserId, 'rating.buyerRating': { $exists: true } }
      ]
    });

    const ratings = [];
    userTrades.forEach(t => {
      if (t.buyer.toString() === targetUserId.toString() && t.rating.sellerRating) {
        ratings.push(t.rating.sellerRating);
      }
      if (t.seller.toString() === targetUserId.toString() && t.rating.buyerRating) {
        ratings.push(t.rating.buyerRating);
      }
    });

    if (ratings.length > 0) {
      const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      await User.findByIdAndUpdate(targetUserId, {
        'rating.average': averageRating,
        'rating.count': ratings.length
      });
    }

    res.json(
      ApiResponse.success(trade.rating, '评分成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('评分失败', 500, error.message)
    );
  }
});

module.exports = router;