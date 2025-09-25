const express = require('express');
const User = require('../models/User');
const Encryption = require('../utils/encryption');
const ApiResponse = require('../utils/response');
const { validate, validationSchemas } = require('../utils/validation');

const router = express.Router();

router.post('/register', validate(validationSchemas.register), async (req, res) => {
  try {
    const { username, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json(
        ApiResponse.error('用户名或邮箱已存在', 409)
      );
    }

    const hashedPassword = await Encryption.hashPassword(password);
    const verificationCode = Encryption.generateResetCode();

    const user = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      role,
      verificationCode
    });

    await user.save();

    const token = Encryption.generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json(
      ApiResponse.success({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }, '注册成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('注册失败', 500, error.message)
    );
  }
});

router.post('/login', validate(validationSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json(
        ApiResponse.error('邮箱或密码错误', 401)
      );
    }

    const isPasswordValid = await Encryption.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        ApiResponse.error('邮箱或密码错误', 401)
      );
    }

    const token = Encryption.generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.json(
      ApiResponse.success({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          balance: user.balance
        }
      }, '登录成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('登录失败', 500, error.message)
    );
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('用户不存在', 404)
      );
    }

    const resetCode = Encryption.generateResetCode();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json(
      ApiResponse.success({ resetCode }, '密码重置码已生成（实际应用中应发送邮件）')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('操作失败', 500, error.message)
    );
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json(
        ApiResponse.error('无效或已过期的重置码', 400)
      );
    }

    const hashedPassword = await Encryption.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json(
      ApiResponse.success(null, '密码重置成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('密码重置失败', 500, error.message)
    );
  }
});

module.exports = router;