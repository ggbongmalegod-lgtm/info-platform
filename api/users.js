const express = require('express');
const User = require('../models/User');
const ApiResponse = require('../utils/response');
const { validate, validationSchemas } = require('../utils/validation');

const router = express.Router();

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -resetPasswordCode -verificationCode');

    if (!user) {
      return res.status(404).json(
        ApiResponse.error('用户不存在', 404)
      );
    }

    res.json(
      ApiResponse.success(user, '获取用户信息成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取用户信息失败', 500, error.message)
    );
  }
});

router.put('/profile', validate(validationSchemas.updateProfile), async (req, res) => {
  try {
    const { username, phone, avatar, bio } = req.body;

    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user.userId }
      });

      if (existingUser) {
        return res.status(409).json(
          ApiResponse.error('用户名已存在', 409)
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username, phone, avatar, bio },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordCode -verificationCode');

    res.json(
      ApiResponse.success(user, '更新用户信息成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('更新用户信息失败', 500, error.message)
    );
  }
});

router.get('/balance', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('balance totalEarnings totalSpent');

    res.json(
      ApiResponse.success({
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        totalSpent: user.totalSpent
      }, '获取余额信息成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取余额信息失败', 500, error.message)
    );
  }
});

router.post('/recharge', async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json(
        ApiResponse.error('充值金额必须大于0', 400)
      );
    }

    const user = await User.findById(req.user.userId);
    user.balance += amount;
    await user.save();

    res.json(
      ApiResponse.success({
        balance: user.balance,
        rechargeAmount: amount
      }, '充值成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('充值失败', 500, error.message)
    );
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username avatar bio rating createdAt')
      .lean();

    if (!user) {
      return res.status(404).json(
        ApiResponse.error('用户不存在', 404)
      );
    }

    res.json(
      ApiResponse.success(user, '获取用户公开信息成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取用户信息失败', 500, error.message)
    );
  }
});

module.exports = router;