const express = require('express');
const Information = require('../models/Information');
const User = require('../models/User');
const Trade = require('../models/Trade');
const ApiResponse = require('../utils/response');
const { validate, validationSchemas } = require('../utils/validation');
const authMiddleware = require('../middleware/auth');
const config = require('../config/config');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      category,
      minPrice,
      maxPrice,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [information, total] = await Promise.all([
      Information.find(filter)
        .select('-content')
        .populate('seller', 'username avatar rating')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Information.countDocuments(filter)
    ]);

    res.json(
      ApiResponse.paginated(information, {
        page: pageNum,
        limit: limitNum,
        total
      })
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取信息列表失败', 500, error.message)
    );
  }
});

router.get('/:id', async (req, res) => {
  try {
    const information = await Information.findById(req.params.id)
      .populate('seller', 'username avatar rating')
      .lean();

    if (!information || !information.isActive) {
      return res.status(404).json(
        ApiResponse.error('信息不存在', 404)
      );
    }

    await Information.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 }
    });

    let hasPurchased = false;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = require('../utils/encryption').verifyToken(token);

        const trade = await Trade.findOne({
          buyer: decoded.userId,
          information: req.params.id,
          status: 'completed'
        });

        hasPurchased = !!trade;
      } catch (err) {
      }
    }

    if (!hasPurchased) {
      delete information.content;
    }

    res.json(
      ApiResponse.success({
        ...information,
        hasPurchased
      }, '获取信息详情成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取信息详情失败', 500, error.message)
    );
  }
});

router.post('/', authMiddleware, validate(validationSchemas.information), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!['seller', 'both'].includes(user.role)) {
      return res.status(403).json(
        ApiResponse.error('只有卖家可以发布信息', 403)
      );
    }

    const { title, description, category, price, tags, isPrivate, content, previewContent } = req.body;

    const information = new Information({
      title,
      description,
      category,
      price,
      tags,
      isPrivate,
      content,
      previewContent: previewContent || description.substring(0, 200),
      seller: req.user.userId
    });

    await information.save();

    const populatedInfo = await Information.findById(information._id)
      .populate('seller', 'username avatar rating')
      .lean();

    res.status(201).json(
      ApiResponse.success(populatedInfo, '发布信息成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('发布信息失败', 500, error.message)
    );
  }
});

router.put('/:id', authMiddleware, validate(validationSchemas.information), async (req, res) => {
  try {
    const information = await Information.findById(req.params.id);

    if (!information) {
      return res.status(404).json(
        ApiResponse.error('信息不存在', 404)
      );
    }

    if (information.seller.toString() !== req.user.userId) {
      return res.status(403).json(
        ApiResponse.error('只能修改自己发布的信息', 403)
      );
    }

    const { title, description, category, price, tags, isPrivate, content, previewContent } = req.body;

    Object.assign(information, {
      title,
      description,
      category,
      price,
      tags,
      isPrivate,
      content,
      previewContent: previewContent || description.substring(0, 200)
    });

    await information.save();

    const populatedInfo = await Information.findById(information._id)
      .populate('seller', 'username avatar rating')
      .lean();

    res.json(
      ApiResponse.success(populatedInfo, '更新信息成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('更新信息失败', 500, error.message)
    );
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const information = await Information.findById(req.params.id);

    if (!information) {
      return res.status(404).json(
        ApiResponse.error('信息不存在', 404)
      );
    }

    if (information.seller.toString() !== req.user.userId) {
      return res.status(403).json(
        ApiResponse.error('只能删除自己发布的信息', 403)
      );
    }

    information.isActive = false;
    await information.save();

    res.json(
      ApiResponse.success(null, '删除信息成功')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('删除信息失败', 500, error.message)
    );
  }
});

router.get('/my/published', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      status = 'all'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { seller: req.user.userId };

    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    const [information, total] = await Promise.all([
      Information.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Information.countDocuments(filter)
    ]);

    res.json(
      ApiResponse.paginated(information, {
        page: pageNum,
        limit: limitNum,
        total
      })
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error('获取我发布的信息失败', 500, error.message)
    );
  }
});

module.exports = router;