const Information = require('../models/Information');
const Trade = require('../models/Trade');
const User = require('../models/User');

class InformationService {
  static async getRecommendations(userId, limit = 10) {
    const userTrades = await Trade.find({
      buyer: userId,
      status: 'completed'
    }).populate('information');

    const purchasedCategories = [...new Set(
      userTrades.map(trade => trade.information.category)
    )];

    const recommendations = await Information.find({
      category: { $in: purchasedCategories },
      seller: { $ne: userId },
      isActive: true
    })
    .populate('seller', 'username avatar rating')
    .sort({ purchases: -1, rating: -1 })
    .limit(limit)
    .lean();

    if (recommendations.length < limit) {
      const additionalInfo = await Information.find({
        seller: { $ne: userId },
        isActive: true,
        _id: { $nin: recommendations.map(r => r._id) }
      })
      .populate('seller', 'username avatar rating')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit - recommendations.length)
      .lean();

      recommendations.push(...additionalInfo);
    }

    return recommendations;
  }

  static async getPopularInformation(options = {}) {
    const {
      category,
      timeRange = 'week',
      limit = 20
    } = options;

    const timeRanges = {
      day: 1,
      week: 7,
      month: 30,
      year: 365
    };

    const days = timeRanges[timeRange] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filter = {
      isActive: true,
      createdAt: { $gte: startDate }
    };

    if (category) {
      filter.category = category;
    }

    return await Information.find(filter)
      .populate('seller', 'username avatar rating')
      .sort({ purchases: -1, views: -1 })
      .limit(limit)
      .lean();
  }

  static async getSellerInformation(sellerId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const filter = { seller: sellerId };

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [information, total] = await Promise.all([
      Information.find(filter)
        .populate('seller', 'username avatar rating')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Information.countDocuments(filter)
    ]);

    return {
      information,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateRating(informationId, rating) {
    const information = await Information.findById(informationId);
    if (!information) {
      throw new Error('信息不存在');
    }

    const currentAverage = information.rating.average || 0;
    const currentCount = information.rating.count || 0;

    const newCount = currentCount + 1;
    const newAverage = ((currentAverage * currentCount) + rating) / newCount;

    information.rating = {
      average: newAverage,
      count: newCount
    };

    await information.save();
    return information;
  }

  static async getCategories() {
    const categories = await Information.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return categories.map(cat => ({
      name: cat._id,
      count: cat.count,
      avgPrice: Math.round(cat.avgPrice * 100) / 100
    }));
  }

  static async searchInformation(query, options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      tags,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = options;

    const filter = { isActive: true };

    if (query) {
      filter.$text = { $search: query };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions.price = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        sortOptions.purchases = -1;
        sortOptions.views = -1;
        break;
      case 'rating':
        sortOptions['rating.average'] = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'relevance':
      default:
        if (query) {
          sortOptions = { score: { $meta: 'textScore' } };
        } else {
          sortOptions.createdAt = -1;
        }
        break;
    }

    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          price: 1,
          tags: 1,
          views: 1,
          purchases: 1,
          rating: 1,
          createdAt: 1,
          'seller.username': 1,
          'seller.avatar': 1,
          'seller.rating': 1
        }
      },
      { $sort: sortOptions },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit }
          ],
          count: [
            { $count: 'total' }
          ]
        }
      }
    ];

    const [result] = await Information.aggregate(aggregationPipeline);
    const information = result.data;
    const total = result.count[0]?.total || 0;

    return {
      information,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = InformationService;