const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = 3000;

// 内存数据存储 (演示用)
let users = [];
let information = [];
let nextUserId = 1;
let nextInfoId = 1;

// 社区数据存储
let posts = [];
let comments = [];
let messages = [];
let groups = [];
let groupMembers = [];
let notifications = [];
let reports = [];
let badges = [];
let userBadges = [];
let nextPostId = 1;
let nextCommentId = 1;
let nextMessageId = 1;
let nextGroupId = 1;
let nextGroupMemberId = 1;
let nextNotificationId = 1;
let nextReportId = 1;
let nextBadgeId = 1;

// 数据分析存储
let userActivityLogs = [];
let postMetrics = [];
let transactionSummary = [];
let nextActivityLogId = 1;
let nextMetricId = 1;
let nextSummaryId = 1;

// AI助手与推荐系统存储
let userPreferences = [];
let recommendationLogs = [];
let dailySummaries = [];
let nextPreferenceId = 1;
let nextRecommendationId = 1;
let nextSummaryDailyId = 1;

// 订阅与付费内容存储
let subscriptions = [];
let paymentRecords = [];
let premiumContent = [];
let nextSubscriptionId = 1;
let nextPaymentId = 1;
let nextPremiumContentId = 1;

// 用户激励与邀请系统存储
let userPoints = [];
let referralCodes = [];
let pointsTransactions = [];
let redeemHistory = [];
let nextPointsId = 1;
let nextReferralId = 1;
let nextUserBadgeId = 1;
let nextTransactionId = 1;
let nextRedeemId = 1;

// 内容交易市场存储
let marketplaceProducts = [];
let marketplaceOrders = [];
let marketplaceTransactions = [];
let productReviews = [];
let nextProductId = 1;
let nextOrderId = 1;
let nextMarketTransactionId = 1;
let nextReviewId = 1;

// 企业定制化服务存储
let enterpriseAccounts = [];
let customReports = [];
let exportLogs = [];
let enterpriseServices = [];
let nextEnterpriseId = 1;
let nextCustomReportId = 1;
let nextExportLogId = 1;
let nextServiceId = 1;

// 中间件
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:5173',
    // GitHub Pages
    /^https:\/\/.*\.github\.io$/,
    // tutoo.life 域名
    'https://tutoo.life',
    'http://tutoo.life'
  ],
  credentials: true
}));
app.use(express.json());

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// 模拟JWT token生成
const generateToken = (user) => {
  return `demo-token-${user.id}-${Date.now()}`;
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mode: 'DEMO_MODE'
  });
});

// 认证API
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  // 检查用户是否已存在
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: '用户名或邮箱已存在'
    });
  }

  // 创建新用户
  const user = {
    id: nextUserId++,
    username,
    email,
    password_hash: 'hashed-' + password, // 演示用，实际应该加密
    nickname: username,
    avatar_url: null,
    status: 1,
    user_type: 1,
    balance: 100, // 演示余额
    created_time: new Date(),
    updated_time: new Date()
  };

  users.push(user);
  const token = generateToken(user);

  const { password_hash, ...userResponse } = user;
  res.status(201).json({
    success: true,
    message: '注册成功',
    data: {
      user: userResponse,
      token
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user || user.password_hash !== 'hashed-' + password) {
    return res.status(401).json({
      success: false,
      message: '邮箱或密码错误'
    });
  }

  const token = generateToken(user);
  const { password_hash, ...userResponse } = user;

  res.json({
    success: true,
    message: '登录成功',
    data: {
      user: userResponse,
      token
    }
  });
});

// 用户API
app.get('/api/users/me', (req, res) => {
  // 简单的token验证
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({
      success: false,
      message: '未授权'
    });
  }

  const userId = parseInt(token.split('-')[2]);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  const { password_hash, ...userResponse } = user;
  res.json({
    success: true,
    data: {
      user: userResponse
    }
  });
});

app.get('/api/users/profile', (req, res) => {
  // 重定向到 /api/users/me
  res.redirect('/api/users/me');
});

// 信息发布API
app.post('/api/information', (req, res) => {
  // 简单的token验证
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({
      success: false,
      message: '未授权'
    });
  }

  const userId = parseInt(token.split('-')[2]);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  const { title, summary, content, category, info_type, price, tags } = req.body;

  // 创建新信息
  const newInfo = {
    id: nextInfoId++,
    user_id: userId,
    title,
    summary,
    content,
    category,
    info_type: parseInt(info_type),
    price: parseFloat(price) || 0,
    view_count: 0,
    like_count: 0,
    collect_count: 0,
    status: 1,
    is_featured: false,
    published_time: new Date(),
    created_time: new Date(),
    tags: tags || []
  };

  information.push(newInfo);

  res.status(201).json({
    success: true,
    message: '信息发布成功',
    data: newInfo
  });
});

// 信息API
app.get('/api/information', (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;

  let filteredInfo = [...information];

  if (category) {
    filteredInfo = filteredInfo.filter(info => info.category === category);
  }

  if (search) {
    filteredInfo = filteredInfo.filter(info =>
      info.title.toLowerCase().includes(search.toLowerCase()) ||
      info.content.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedInfo = filteredInfo.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      list: paginatedInfo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredInfo.length,
        totalPages: Math.ceil(filteredInfo.length / limit)
      }
    }
  });
});

app.get('/api/information/:id', (req, res) => {
  const info = information.find(i => i.id === parseInt(req.params.id));

  if (!info) {
    return res.status(404).json({
      success: false,
      message: '信息不存在'
    });
  }

  res.json({
    success: true,
    data: info
  });
});

// 初始化一些演示数据
const initDemoData = () => {
  // 创建演示用户
  users.push({
    id: nextUserId++,
    username: 'demo_user',
    email: 'demo@example.com',
    password_hash: 'hashed-123456',
    nickname: '演示用户',
    avatar_url: null,
    status: 1,
    user_type: 1,
    balance: 500,
    created_time: new Date(),
    updated_time: new Date()
  });

  // 添加注册的用户（为了解决重启数据丢失问题）
  users.push({
    id: nextUserId++,
    username: '123',
    email: 'ggbongmalegod@qq.com',
    password_hash: 'hashed-123456',
    nickname: '123',
    avatar_url: null,
    status: 1,
    user_type: 1,
    balance: 0.01,
    created_time: new Date(),
    updated_time: new Date()
  });

  // 创建演示信息
  const demoInfoList = [
    {
      id: nextInfoId++,
      title: '最新AI技术趋势分析',
      summary: '深度解析2024年AI领域的重要技术趋势和商业机会',
      content: '这里是详细的AI技术分析内容...',
      category: 'tech',
      info_type: 1, // 免费
      price: 0,
      view_count: 156,
      like_count: 23,
      collect_count: 12,
      status: 1,
      is_featured: true,
      published_time: new Date(),
      created_time: new Date()
    },
    {
      id: nextInfoId++,
      title: '独家投资策略报告',
      summary: '资深投资者分享的2024年投资策略和风险控制方法',
      content: '这是付费内容，需要购买后查看...',
      category: 'finance',
      info_type: 2, // 付费
      price: 99.99,
      view_count: 89,
      like_count: 15,
      collect_count: 8,
      status: 1,
      is_featured: false,
      published_time: new Date(),
      created_time: new Date()
    },
    {
      id: nextInfoId++,
      title: '电商运营实战手册',
      summary: '从0到1教你搭建高效的电商运营体系',
      content: '详细的电商运营实战经验分享...',
      category: 'business',
      info_type: 2, // 付费
      price: 68.00,
      view_count: 234,
      like_count: 45,
      collect_count: 28,
      status: 1,
      is_featured: true,
      published_time: new Date(),
      created_time: new Date()
    }
  ];

  information.push(...demoInfoList);

  // 创建演示社区数据
  // 创建演示帖子
  const demoPosts = [
    {
      id: nextPostId++,
      user_id: 1,
      title: '新手入门：如何在平台上发布优质信息',
      content: '大家好！作为平台的新用户，我想分享一些发布信息的小技巧。首先，确保内容原创且有价值；其次，选择合适的分类和标签；最后，定价要合理。希望对大家有帮助！',
      likes: 25,
      views: 156,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: nextPostId++,
      user_id: 2,
      title: '分享：我的第一笔交易经验',
      content: '刚刚完成了在平台上的第一笔购买，想和大家分享一下经验。整个流程很顺畅，信息质量也很高，确实值得这个价格。推荐大家多关注一些优质创作者！',
      likes: 18,
      views: 89,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12小时前
      updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: 'active'
    }
  ];

  posts.push(...demoPosts);

  // 创建演示评论
  const demoComments = [
    {
      id: nextCommentId++,
      post_id: 1,
      user_id: 2,
      content: '感谢分享！这些技巧很实用，特别是关于定价的建议。',
      created_at: new Date(Date.now() - 23 * 60 * 60 * 1000)
    },
    {
      id: nextCommentId++,
      post_id: 1,
      user_id: 1,
      content: '不客气！大家一起进步💪',
      created_at: new Date(Date.now() - 22 * 60 * 60 * 1000)
    }
  ];

  comments.push(...demoComments);

  // 创建演示群组
  const demoGroups = [
    {
      id: nextGroupId++,
      name: '信息分享交流群',
      description: '这里是大家分享优质信息、交流经验的地方，欢迎新老用户加入讨论！',
      owner_id: 1,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3天前
    },
    {
      id: nextGroupId++,
      name: '新手指导中心',
      description: '专为平台新手用户提供指导和帮助，有问题可以在这里咨询。',
      owner_id: 1,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2天前
    }
  ];

  groups.push(...demoGroups);

  // 添加群组成员
  const demoGroupMembers = [
    {
      id: nextGroupMemberId++,
      group_id: 1,
      user_id: 1,
      role: 'owner',
      joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: nextGroupMemberId++,
      group_id: 1,
      user_id: 2,
      role: 'member',
      joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: nextGroupMemberId++,
      group_id: 2,
      user_id: 1,
      role: 'owner',
      joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  groupMembers.push(...demoGroupMembers);

  // 创建演示通知
  const demoNotifications = [
    {
      id: nextNotificationId++,
      user_id: 1,
      type: 'like',
      content: '123 赞了您的帖子《新手入门：如何在平台上发布优质信息》',
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
    }
  ];

  notifications.push(...demoNotifications);

  // 创建演示活动日志
  const demoActivities = [
    {
      id: nextActivityLogId++,
      user_id: 1,
      action: 'view',
      target_type: 'post',
      target_id: 1,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: nextActivityLogId++,
      user_id: 2,
      action: 'like',
      target_type: 'post',
      target_id: 1,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: nextActivityLogId++,
      user_id: 1,
      action: 'comment',
      target_type: 'post',
      target_id: 2,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: nextActivityLogId++,
      user_id: 2,
      action: 'purchase',
      target_type: 'information',
      target_id: 2,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ];

  userActivityLogs.push(...demoActivities);

  // 初始化AI助手推荐数据
  const demoPreferences = [
    {
      id: nextPreferenceId++,
      user_id: 1,
      category_preferences: ['tech', 'business'],
      content_types: ['free', 'paid'],
      interaction_history: {
        viewed_categories: { tech: 15, business: 8, finance: 3 },
        liked_posts: [1, 3, 5],
        purchased_items: [2]
      },
      updated_at: new Date()
    },
    {
      id: nextPreferenceId++,
      user_id: 3,
      category_preferences: ['finance', 'business'],
      content_types: ['paid'],
      interaction_history: {
        viewed_categories: { finance: 12, business: 6, tech: 2 },
        liked_posts: [2, 4],
        purchased_items: [2]
      },
      updated_at: new Date()
    }
  ];

  userPreferences.push(...demoPreferences);

  const demoRecommendations = [
    {
      id: nextRecommendationId++,
      user_id: 1,
      content_type: 'post',
      content_id: 2,
      reason: '基于您对技术内容的兴趣',
      score: 0.85,
      created_at: new Date()
    },
    {
      id: nextRecommendationId++,
      user_id: 1,
      content_type: 'information',
      content_id: 3,
      reason: '相似用户也喜欢这个内容',
      score: 0.78,
      created_at: new Date()
    }
  ];

  recommendationLogs.push(...demoRecommendations);

  const demoDailySummaries = [
    {
      id: nextSummaryDailyId++,
      user_id: 1,
      date: new Date().toISOString().split('T')[0],
      summary: {
        new_posts: 3,
        trending_topics: ['AI技术', '区块链', '电商运营'],
        recommended_content: [
          { title: '最新AI技术趋势分析', category: 'tech', type: 'free' },
          { title: '电商运营实战手册', category: 'business', type: 'paid' }
        ],
        personal_insights: '您最感兴趣的技术类内容今天有2篇新发布，建议优先查看'
      },
      created_at: new Date()
    }
  ];

  dailySummaries.push(...demoDailySummaries);

  // 初始化订阅与付费内容数据
  const demoSubscriptions = [
    {
      id: nextSubscriptionId++,
      user_id: 1,
      subscription_type: 'premium',
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      auto_renewal: true,
      price: 29.99,
      features: [
        'unlimited_downloads',
        'priority_support',
        'exclusive_content',
        'advanced_analytics'
      ],
      created_at: new Date()
    },
    {
      id: nextSubscriptionId++,
      user_id: 3,
      subscription_type: 'basic',
      status: 'active',
      start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15天前
      end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15天后
      auto_renewal: false,
      price: 9.99,
      features: [
        'basic_downloads',
        'standard_support'
      ],
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  ];

  subscriptions.push(...demoSubscriptions);

  const demoPaymentRecords = [
    {
      id: nextPaymentId++,
      user_id: 1,
      subscription_id: 1,
      amount: 29.99,
      payment_method: 'credit_card',
      payment_status: 'completed',
      transaction_id: 'txn_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date()
    },
    {
      id: nextPaymentId++,
      user_id: 3,
      subscription_id: 2,
      amount: 9.99,
      payment_method: 'alipay',
      payment_status: 'completed',
      transaction_id: 'txn_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  ];

  paymentRecords.push(...demoPaymentRecords);

  const demoPremiumContent = [
    {
      id: nextPremiumContentId++,
      title: '2024年度深度投资分析报告',
      description: '包含全球股市、基金、数字货币等投资机会的专业分析',
      content_type: 'report',
      subscription_required: 'premium',
      file_url: '/premium/investment-report-2024.pdf',
      preview_content: '这是一份由专业投资顾问团队精心制作的年度投资分析报告...',
      download_count: 156,
      rating: 4.8,
      created_at: new Date()
    },
    {
      id: nextPremiumContentId++,
      title: 'AI创业项目实战指南',
      description: '从零开始的AI创业完整指南，包含技术栈选择、团队建设等',
      content_type: 'guide',
      subscription_required: 'basic',
      file_url: '/premium/ai-startup-guide.pdf',
      preview_content: '在人工智能快速发展的今天，越来越多的创业者希望在这个领域创业...',
      download_count: 89,
      rating: 4.6,
      created_at: new Date()
    },
    {
      id: nextPremiumContentId++,
      title: '独家市场调研数据包',
      description: '包含多个行业的最新市场调研数据，专业机构出品',
      content_type: 'data',
      subscription_required: 'premium',
      file_url: '/premium/market-research-data.zip',
      preview_content: '本数据包包含了2024年最新的市场调研数据，涵盖技术、金融、消费等多个领域...',
      download_count: 234,
      rating: 4.9,
      created_at: new Date()
    }
  ];

  premiumContent.push(...demoPremiumContent);

  // 初始化用户激励与邀请系统数据
  const demoUserPoints = [
    {
      id: nextPointsId++,
      user_id: 1,
      total_points: 1250,
      available_points: 850,
      used_points: 400,
      level: 3,
      level_name: '银牌会员',
      next_level_points: 2000,
      created_at: new Date()
    },
    {
      id: nextPointsId++,
      user_id: 3,
      total_points: 500,
      available_points: 450,
      used_points: 50,
      level: 2,
      level_name: '铜牌会员',
      next_level_points: 1000,
      created_at: new Date()
    }
  ];

  userPoints.push(...demoUserPoints);

  const demoReferralCodes = [
    {
      id: nextReferralId++,
      user_id: 1,
      referral_code: 'DEMO001',
      referred_count: 3,
      total_rewards: 300,
      is_active: true,
      created_at: new Date()
    },
    {
      id: nextReferralId++,
      user_id: 3,
      referral_code: 'DEMO003',
      referred_count: 1,
      total_rewards: 100,
      is_active: true,
      created_at: new Date()
    }
  ];

  referralCodes.push(...demoReferralCodes);

  const demoBadges = [
    {
      id: nextUserBadgeId++,
      user_id: 1,
      badge_type: 'early_adopter',
      badge_name: '早期用户',
      badge_description: '平台早期注册用户',
      badge_icon: '🌟',
      earned_at: new Date()
    },
    {
      id: nextUserBadgeId++,
      user_id: 1,
      badge_type: 'active_poster',
      badge_name: '活跃发布者',
      badge_description: '发布超过10篇优质内容',
      badge_icon: '📝',
      earned_at: new Date()
    },
    {
      id: nextUserBadgeId++,
      user_id: 3,
      badge_type: 'newcomer',
      badge_name: '新手上路',
      badge_description: '完成首次注册',
      badge_icon: '🎯',
      earned_at: new Date()
    }
  ];

  userBadges.push(...demoBadges);

  const demoPointsTransactions = [
    {
      id: nextTransactionId++,
      user_id: 1,
      transaction_type: 'earn',
      points: 100,
      reason: '邀请好友注册',
      description: '成功邀请用户 demo_user2 注册',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: nextTransactionId++,
      user_id: 1,
      transaction_type: 'earn',
      points: 50,
      reason: '发布优质内容',
      description: '发布的帖子获得20个赞',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: nextTransactionId++,
      user_id: 1,
      transaction_type: 'spend',
      points: -200,
      reason: '兑换奖励',
      description: '兑换高级会员7天体验',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      id: nextTransactionId++,
      user_id: 3,
      transaction_type: 'earn',
      points: 100,
      reason: '新用户注册奖励',
      description: '首次注册平台奖励',
      created_at: new Date()
    }
  ];

  pointsTransactions.push(...demoPointsTransactions);

  const demoRedeemHistory = [
    {
      id: nextRedeemId++,
      user_id: 1,
      reward_type: 'premium_trial',
      reward_name: '高级会员7天体验',
      points_cost: 200,
      status: 'completed',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ];

  redeemHistory.push(...demoRedeemHistory);

  // 初始化内容交易市场数据
  const demoMarketplaceProducts = [
    {
      id: nextProductId++,
      seller_id: 1,
      title: '2024年AI行业深度报告',
      description: '全面分析AI行业发展趋势、投资机会和技术突破',
      category: 'report',
      price: 99.99,
      original_price: 149.99,
      content_type: 'pdf',
      file_size: '15.2MB',
      preview_content: '本报告包含AI行业最新发展趋势、市场分析、技术突破等...',
      tags: ['AI', '人工智能', '行业报告', '投资'],
      status: 'active',
      featured: true,
      download_count: 234,
      rating: 4.8,
      review_count: 56,
      commission_rate: 0.1,
      created_at: new Date()
    },
    {
      id: nextProductId++,
      seller_id: 1,
      title: '电商运营核心数据包',
      description: '包含用户行为分析、转化率优化、营销策略等核心数据',
      category: 'data',
      price: 199.99,
      original_price: 299.99,
      content_type: 'excel',
      file_size: '8.5MB',
      preview_content: '数据包包含电商运营的核心指标分析，帮助提升运营效率...',
      tags: ['电商', '数据分析', '运营', '营销'],
      status: 'active',
      featured: false,
      download_count: 156,
      rating: 4.6,
      review_count: 32,
      commission_rate: 0.15,
      created_at: new Date()
    },
    {
      id: nextProductId++,
      seller_id: 3,
      title: '区块链技术实战指南',
      description: '从入门到精通的区块链技术完整学习路径',
      category: 'course',
      price: 299.99,
      original_price: 399.99,
      content_type: 'video',
      file_size: '2.1GB',
      preview_content: '课程涵盖区块链基础理论、智能合约开发、DeFi应用等...',
      tags: ['区块链', '技术教程', '编程', '加密货币'],
      status: 'active',
      featured: true,
      download_count: 89,
      rating: 4.9,
      review_count: 28,
      commission_rate: 0.2,
      created_at: new Date()
    }
  ];

  marketplaceProducts.push(...demoMarketplaceProducts);

  const demoMarketplaceOrders = [
    {
      id: nextOrderId++,
      buyer_id: 3,
      seller_id: 1,
      product_id: 1,
      quantity: 1,
      unit_price: 99.99,
      total_amount: 99.99,
      commission_amount: 9.99,
      status: 'completed',
      payment_method: 'balance',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  marketplaceOrders.push(...demoMarketplaceOrders);

  const demoMarketplaceTransactions = [
    {
      id: nextMarketTransactionId++,
      order_id: 1,
      buyer_id: 3,
      seller_id: 1,
      product_id: 1,
      amount: 99.99,
      commission: 9.99,
      seller_earnings: 89.99,
      transaction_type: 'sale',
      status: 'completed',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  marketplaceTransactions.push(...demoMarketplaceTransactions);

  const demoProductReviews = [
    {
      id: nextReviewId++,
      product_id: 1,
      user_id: 3,
      rating: 5,
      comment: '报告内容非常详细，数据准确，对投资决策很有帮助！',
      helpful_count: 12,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: nextReviewId++,
      product_id: 2,
      user_id: 3,
      rating: 4,
      comment: '数据很全面，格式清晰，值得购买。',
      helpful_count: 8,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  productReviews.push(...demoProductReviews);

  // AI风控与内容审核演示数据
  const demoModerationRules = [
    {
      id: 1,
      name: '敏感词汇检测',
      type: 'keyword',
      pattern: '敏感|违规|欺诈',
      action: 'flag',
      enabled: true,
      created_by: 1,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      triggered_count: 15
    },
    {
      id: 2,
      name: '垃圾邮件检测',
      type: 'spam',
      pattern: 'spam_detection_model',
      action: 'auto_reject',
      enabled: true,
      created_by: 1,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      triggered_count: 32
    },
    {
      id: 3,
      name: '暴力内容检测',
      type: 'violence',
      pattern: 'violence_detection_ai',
      action: 'manual_review',
      enabled: true,
      created_by: 1,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      triggered_count: 8
    }
  ];

  moderationRules.push(...demoModerationRules);

  const demoAiModels = [
    {
      id: 1,
      name: '文本分类模型',
      type: 'text_classification',
      version: '2.1.0',
      accuracy: 0.94,
      status: 'active',
      config: {
        threshold: 0.8,
        language: 'zh-CN',
        categories: ['spam', 'normal', 'suspicious']
      },
      last_trained: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: '图像内容检测',
      type: 'image_moderation',
      version: '1.8.2',
      accuracy: 0.89,
      status: 'active',
      config: {
        threshold: 0.75,
        detect_adult: true,
        detect_violence: true,
        detect_fake: false
      },
      last_trained: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      name: '用户行为分析',
      type: 'behavior_analysis',
      version: '3.0.1',
      accuracy: 0.91,
      status: 'training',
      config: {
        features: ['login_pattern', 'content_frequency', 'interaction_rate'],
        update_interval: '1h',
        anomaly_threshold: 0.85
      },
      last_trained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  aiModels.push(...demoAiModels);

  const demoRiskControlLogs = [
    {
      id: 1,
      type: 'content_check',
      content_id: 'post_12345',
      user_id: 2,
      risk_score: 0.85,
      status: 'flagged',
      details: ['敏感词汇'],
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: 'user_behavior',
      content_id: 'user_67890',
      user_id: 3,
      risk_score: 0.65,
      status: 'approved',
      details: ['异常登录时间'],
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'content_check',
      content_id: 'comment_54321',
      user_id: 4,
      risk_score: 0.92,
      status: 'blocked',
      details: ['垃圾邮件特征', '违规链接'],
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ];

  riskControlLogs.push(...demoRiskControlLogs);

  const demoModerationQueue = [
    {
      id: 1,
      content_id: 'post_12345',
      content_type: 'post',
      content_preview: '这是一个包含敏感词汇的帖子内容预览...',
      risk_score: 0.85,
      detected_issues: ['敏感词汇'],
      ai_confidence: 0.92,
      status: 'pending',
      priority: 'high',
      checked_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      content_id: 'comment_98765',
      content_type: 'comment',
      content_preview: '疑似垃圾评论内容，包含多个可疑链接...',
      risk_score: 0.78,
      detected_issues: ['垃圾邮件特征'],
      ai_confidence: 0.88,
      status: 'pending',
      priority: 'medium',
      checked_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];

  contentModerationQueue.push(...demoModerationQueue);

  const demoSecurityAlerts = [
    {
      id: 1,
      type: 'suspicious_activity',
      severity: 'high',
      title: '异常登录活动检测',
      description: '检测到用户账号在短时间内从多个地理位置登录',
      affected_user_id: 2,
      status: 'active',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      metadata: {
        ip_addresses: ['192.168.1.1', '10.0.0.1'],
        login_times: [
          new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
        ]
      }
    },
    {
      id: 2,
      type: 'content_violation',
      severity: 'medium',
      title: '批量违规内容发布',
      description: '用户在短时间内发布大量可能违规的内容',
      affected_user_id: 3,
      status: 'active',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      metadata: {
        content_count: 15,
        time_span: '30分钟',
        violation_types: ['spam', 'duplicate']
      }
    },
    {
      id: 3,
      type: 'system_anomaly',
      severity: 'low',
      title: 'API调用频率异常',
      description: '某些API端点的调用频率显著增加',
      affected_user_id: null,
      status: 'resolved',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      handled_by: 1,
      handled_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      notes: '已确认为正常业务增长导致',
      metadata: {
        endpoints: ['/api/posts', '/api/users/me'],
        increase_percentage: 45
      }
    }
  ];

  securityAlerts.push(...demoSecurityAlerts);
};

// ========== AI助手与推荐系统 API ==========

// 获取每日摘要
app.get('/api/assistant/daily_summary', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const today = new Date().toISOString().split('T')[0];

  // 获取用户今日摘要
  let todaySummary = dailySummaries.find(s => s.user_id === userId && s.date === today);

  if (!todaySummary) {
    // 如果没有今日摘要，生成一个
    const userPreference = userPreferences.find(p => p.user_id === userId);
    const trendingCategories = userPreference ? userPreference.category_preferences : ['tech', 'business'];

    todaySummary = {
      id: nextSummaryDailyId++,
      user_id: userId,
      date: today,
      summary: {
        new_posts: posts.filter(p => p.created_at.toISOString().split('T')[0] === today).length,
        trending_topics: trendingCategories.map(cat => {
          const categoryMap = {
            tech: 'AI技术',
            business: '商业策略',
            finance: '投资理财'
          };
          return categoryMap[cat] || cat;
        }),
        recommended_content: information.filter(info =>
          trendingCategories.includes(info.category)
        ).slice(0, 3).map(info => ({
          id: info.id,
          title: info.title,
          category: info.category,
          type: info.info_type === 1 ? 'free' : 'paid'
        })),
        personal_insights: '根据您的浏览历史，为您推荐了最新的相关内容'
      },
      created_at: new Date()
    };

    dailySummaries.push(todaySummary);
  }

  res.json({
    success: true,
    data: todaySummary.summary
  });
});

// 获取个性化推荐
app.get('/api/assistant/recommendations', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const { type = 'all', limit = 10 } = req.query;

  // 获取用户偏好
  const userPreference = userPreferences.find(p => p.user_id === userId);

  let recommendations = [];

  if (type === 'posts' || type === 'all') {
    // 推荐帖子
    const recommendedPosts = posts
      .filter(post => post.user_id !== userId) // 不推荐自己的帖子
      .map(post => ({
        id: post.id,
        type: 'post',
        title: post.title,
        content: post.content.substring(0, 100) + '...',
        author: post.user ? post.user.nickname : '匿名用户',
        likes: post.likes,
        views: post.views,
        created_at: post.created_at,
        reason: '基于您的兴趣推荐',
        score: Math.random() * 0.5 + 0.5 // 模拟推荐分数
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.floor(limit / 2));

    recommendations.push(...recommendedPosts);
  }

  if (type === 'information' || type === 'all') {
    // 推荐信息内容
    let filteredInfo = information;

    if (userPreference) {
      // 根据用户偏好过滤
      filteredInfo = information.filter(info =>
        userPreference.category_preferences.includes(info.category) ||
        userPreference.content_types.includes(info.info_type === 1 ? 'free' : 'paid')
      );
    }

    const recommendedInfo = filteredInfo
      .map(info => ({
        id: info.id,
        type: 'information',
        title: info.title,
        summary: info.summary,
        category: info.category,
        price: info.price,
        view_count: info.view_count,
        created_at: info.created_time,
        reason: userPreference ? '基于您的偏好设置' : '热门推荐',
        score: Math.random() * 0.3 + 0.7 // 信息内容分数稍高
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.floor(limit / 2));

    recommendations.push(...recommendedInfo);
  }

  // 混合排序
  recommendations.sort((a, b) => b.score - a.score);
  recommendations = recommendations.slice(0, limit);

  res.json({
    success: true,
    data: {
      recommendations,
      total: recommendations.length,
      user_preferences: userPreference || null
    }
  });
});

// 更新用户偏好
app.post('/api/assistant/preferences', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const { category_preferences, content_types } = req.body;

  let userPreference = userPreferences.find(p => p.user_id === userId);

  if (userPreference) {
    // 更新现有偏好
    userPreference.category_preferences = category_preferences;
    userPreference.content_types = content_types;
    userPreference.updated_at = new Date();
  } else {
    // 创建新偏好
    userPreference = {
      id: nextPreferenceId++,
      user_id: userId,
      category_preferences,
      content_types,
      interaction_history: {
        viewed_categories: {},
        liked_posts: [],
        purchased_items: []
      },
      updated_at: new Date()
    };
    userPreferences.push(userPreference);
  }

  res.json({
    success: true,
    message: '偏好设置已更新',
    data: userPreference
  });
});

// 记录用户交互行为（用于改进推荐）
app.post('/api/assistant/interaction', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const { action, target_type, target_id, category } = req.body;

  // 更新用户偏好中的交互历史
  let userPreference = userPreferences.find(p => p.user_id === userId);

  if (!userPreference) {
    userPreference = {
      id: nextPreferenceId++,
      user_id: userId,
      category_preferences: [],
      content_types: ['free', 'paid'],
      interaction_history: {
        viewed_categories: {},
        liked_posts: [],
        purchased_items: []
      },
      updated_at: new Date()
    };
    userPreferences.push(userPreference);
  }

  // 更新交互历史
  if (category && action === 'view') {
    userPreference.interaction_history.viewed_categories[category] =
      (userPreference.interaction_history.viewed_categories[category] || 0) + 1;
  }

  if (action === 'like' && target_type === 'post') {
    if (!userPreference.interaction_history.liked_posts.includes(target_id)) {
      userPreference.interaction_history.liked_posts.push(target_id);
    }
  }

  if (action === 'purchase' && target_type === 'information') {
    if (!userPreference.interaction_history.purchased_items.includes(target_id)) {
      userPreference.interaction_history.purchased_items.push(target_id);
    }
  }

  userPreference.updated_at = new Date();

  // 记录推荐日志
  const recommendationLog = {
    id: nextRecommendationId++,
    user_id: userId,
    action,
    target_type,
    target_id,
    category,
    created_at: new Date()
  };

  recommendationLogs.push(recommendationLog);

  res.json({
    success: true,
    message: '交互记录已保存'
  });
});

// ========== 订阅与付费内容 API ==========

// 获取订阅计划
app.get('/api/subscription/plans', (req, res) => {
  const plans = [
    {
      id: 'free',
      name: '免费版',
      price: 0,
      duration: 0,
      features: [
        '每月5次下载',
        '基础客服支持',
        '免费内容访问'
      ],
      description: '适合轻度使用用户'
    },
    {
      id: 'basic',
      name: '基础版',
      price: 9.99,
      duration: 30,
      features: [
        '每月20次下载',
        '标准客服支持',
        '基础付费内容访问',
        '邮件通知'
      ],
      description: '适合普通用户'
    },
    {
      id: 'premium',
      name: '高级版',
      price: 29.99,
      duration: 30,
      features: [
        '无限下载',
        '优先客服支持',
        '所有付费内容访问',
        '高级数据分析',
        'API访问权限',
        '独家内容抢先体验'
      ],
      description: '适合专业用户和企业'
    }
  ];

  res.json({
    success: true,
    data: plans
  });
});

// 获取用户订阅状态
app.get('/api/subscription/status', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const userSubscription = subscriptions.find(s => s.user_id === userId && s.status === 'active');

  if (!userSubscription) {
    return res.json({
      success: true,
      data: {
        subscription_type: 'free',
        status: 'inactive',
        features: ['每月5次下载', '基础客服支持', '免费内容访问'],
        downloads_remaining: 5
      }
    });
  }

  // 检查订阅是否过期
  const now = new Date();
  if (userSubscription.end_date < now) {
    userSubscription.status = 'expired';
  }

  res.json({
    success: true,
    data: {
      subscription_type: userSubscription.subscription_type,
      status: userSubscription.status,
      start_date: userSubscription.start_date,
      end_date: userSubscription.end_date,
      auto_renewal: userSubscription.auto_renewal,
      features: userSubscription.features,
      downloads_remaining: userSubscription.subscription_type === 'premium' ? -1 :
        (userSubscription.subscription_type === 'basic' ? 20 : 5)
    }
  });
});

// 订阅服务
app.post('/api/subscription/subscribe', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const { subscription_type, payment_method } = req.body;

  if (!['basic', 'premium'].includes(subscription_type)) {
    return res.status(400).json({
      success: false,
      message: '无效的订阅类型'
    });
  }

  // 检查是否已有有效订阅
  const existingSubscription = subscriptions.find(s =>
    s.user_id === userId && s.status === 'active'
  );

  if (existingSubscription) {
    return res.status(400).json({
      success: false,
      message: '您已有活跃的订阅，请先取消当前订阅'
    });
  }

  // 创建新订阅
  const price = subscription_type === 'basic' ? 9.99 : 29.99;
  const features = subscription_type === 'basic' ?
    ['basic_downloads', 'standard_support'] :
    ['unlimited_downloads', 'priority_support', 'exclusive_content', 'advanced_analytics'];

  const newSubscription = {
    id: nextSubscriptionId++,
    user_id: userId,
    subscription_type,
    status: 'active',
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    auto_renewal: true,
    price,
    features,
    created_at: new Date()
  };

  subscriptions.push(newSubscription);

  // 创建支付记录
  const paymentRecord = {
    id: nextPaymentId++,
    user_id: userId,
    subscription_id: newSubscription.id,
    amount: price,
    payment_method: payment_method || 'credit_card',
    payment_status: 'completed',
    transaction_id: 'txn_' + Math.random().toString(36).substr(2, 9),
    created_at: new Date()
  };

  paymentRecords.push(paymentRecord);

  res.json({
    success: true,
    message: '订阅成功',
    data: {
      subscription: newSubscription,
      payment: paymentRecord
    }
  });
});

// 取消订阅
app.post('/api/subscription/cancel', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const userSubscription = subscriptions.find(s =>
    s.user_id === userId && s.status === 'active'
  );

  if (!userSubscription) {
    return res.status(404).json({
      success: false,
      message: '未找到活跃的订阅'
    });
  }

  // 取消自动续费，但保持到期前有效
  userSubscription.auto_renewal = false;

  res.json({
    success: true,
    message: '订阅取消成功，将在到期时停止服务',
    data: userSubscription
  });
});

// 获取付费内容列表
app.get('/api/subscription/premium-content', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const { page = 1, limit = 10, content_type } = req.query;

  // 获取用户订阅状态
  const userSubscription = subscriptions.find(s => s.user_id === userId && s.status === 'active');
  const userSubscriptionType = userSubscription ? userSubscription.subscription_type : 'free';

  // 过滤内容
  let filteredContent = premiumContent;

  if (content_type) {
    filteredContent = filteredContent.filter(content => content.content_type === content_type);
  }

  // 根据订阅类型显示可访问的内容
  const accessibleContent = filteredContent.map(content => {
    const canAccess = userSubscriptionType === 'premium' ||
      (userSubscriptionType === 'basic' && content.subscription_required === 'basic') ||
      content.subscription_required === 'free';

    return {
      ...content,
      can_access: canAccess,
      preview_only: !canAccess
    };
  });

  const startIndex = (page - 1) * limit;
  const paginatedContent = accessibleContent.slice(startIndex, startIndex + limit);

  res.json({
    success: true,
    data: {
      content: paginatedContent,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(accessibleContent.length / limit),
        total_items: accessibleContent.length,
        per_page: parseInt(limit)
      },
      user_subscription: {
        type: userSubscriptionType,
        can_upgrade: userSubscriptionType !== 'premium'
      }
    }
  });
});

// 下载付费内容
app.post('/api/subscription/download/:contentId', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const contentId = parseInt(req.params.contentId);

  // 查找内容
  const content = premiumContent.find(c => c.id === contentId);
  if (!content) {
    return res.status(404).json({
      success: false,
      message: '内容不存在'
    });
  }

  // 检查用户订阅权限
  const userSubscription = subscriptions.find(s => s.user_id === userId && s.status === 'active');
  const userSubscriptionType = userSubscription ? userSubscription.subscription_type : 'free';

  const canAccess = userSubscriptionType === 'premium' ||
    (userSubscriptionType === 'basic' && content.subscription_required === 'basic') ||
    content.subscription_required === 'free';

  if (!canAccess) {
    return res.status(403).json({
      success: false,
      message: '需要升级订阅才能访问此内容',
      required_subscription: content.subscription_required
    });
  }

  // 增加下载计数
  content.download_count++;

  res.json({
    success: true,
    message: '下载链接已生成',
    data: {
      download_url: content.file_url,
      content_title: content.title,
      expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期
    }
  });
});

// 获取支付历史
app.get('/api/subscription/payment-history', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const userPayments = paymentRecords.filter(p => p.user_id === userId);

  res.json({
    success: true,
    data: userPayments
  });
});

// ========== 用户激励与邀请系统 API ==========

// 获取用户积分信息
app.get('/api/referral/points', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  let userPoint = userPoints.find(p => p.user_id === userId);

  if (!userPoint) {
    // 创建新用户积分记录
    userPoint = {
      id: nextPointsId++,
      user_id: userId,
      total_points: 100, // 新用户奖励
      available_points: 100,
      used_points: 0,
      level: 1,
      level_name: '新手会员',
      next_level_points: 500,
      created_at: new Date()
    };
    userPoints.push(userPoint);

    // 添加新用户奖励记录
    const newUserReward = {
      id: nextTransactionId++,
      user_id: userId,
      transaction_type: 'earn',
      points: 100,
      reason: '新用户注册奖励',
      description: '首次注册平台奖励',
      created_at: new Date()
    };
    pointsTransactions.push(newUserReward);
  }

  // 获取用户徽章
  const badges = userBadges.filter(b => b.user_id === userId);

  // 获取最近的积分记录
  const recentTransactions = pointsTransactions
    .filter(t => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  res.json({
    success: true,
    data: {
      points: userPoint,
      badges,
      recent_transactions: recentTransactions
    }
  });
});

// 获取邀请码信息
app.get('/api/referral/code', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  let userReferral = referralCodes.find(r => r.user_id === userId);

  if (!userReferral) {
    // 生成新的邀请码
    const generateReferralCode = () => {
      return 'REF' + userId + Math.random().toString(36).substr(2, 6).toUpperCase();
    };

    userReferral = {
      id: nextReferralId++,
      user_id: userId,
      referral_code: generateReferralCode(),
      referred_count: 0,
      total_rewards: 0,
      is_active: true,
      created_at: new Date()
    };
    referralCodes.push(userReferral);
  }

  res.json({
    success: true,
    data: userReferral
  });
});

// 使用邀请码注册（在注册时调用）
app.post('/api/referral/use', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { referral_code } = req.body;
  const newUserId = auth.user.id;

  if (!referral_code) {
    return res.status(400).json({
      success: false,
      message: '邀请码不能为空'
    });
  }

  // 查找邀请码
  const referralRecord = referralCodes.find(r => r.referral_code === referral_code && r.is_active);

  if (!referralRecord) {
    return res.status(404).json({
      success: false,
      message: '邀请码无效或已失效'
    });
  }

  if (referralRecord.user_id === newUserId) {
    return res.status(400).json({
      success: false,
      message: '不能使用自己的邀请码'
    });
  }

  // 更新邀请者的邀请记录
  referralRecord.referred_count++;
  referralRecord.total_rewards += 100; // 每邀请一人奖励100积分

  // 给邀请者增加积分
  let inviterPoints = userPoints.find(p => p.user_id === referralRecord.user_id);
  if (inviterPoints) {
    inviterPoints.total_points += 100;
    inviterPoints.available_points += 100;
  }

  // 记录邀请者的积分交易
  const inviterTransaction = {
    id: nextTransactionId++,
    user_id: referralRecord.user_id,
    transaction_type: 'earn',
    points: 100,
    reason: '邀请好友注册',
    description: `成功邀请用户 ${auth.user.username} 注册`,
    created_at: new Date()
  };
  pointsTransactions.push(inviterTransaction);

  // 给新用户奖励50积分
  let newUserPoints = userPoints.find(p => p.user_id === newUserId);
  if (newUserPoints) {
    newUserPoints.total_points += 50;
    newUserPoints.available_points += 50;
  }

  // 记录新用户的积分交易
  const newUserTransaction = {
    id: nextTransactionId++,
    user_id: newUserId,
    transaction_type: 'earn',
    points: 50,
    reason: '使用邀请码注册',
    description: `使用邀请码 ${referral_code} 注册获得奖励`,
    created_at: new Date()
  };
  pointsTransactions.push(newUserTransaction);

  res.json({
    success: true,
    message: '邀请码使用成功',
    data: {
      inviter_reward: 100,
      new_user_reward: 50
    }
  });
});

// 获取积分商城商品列表
app.get('/api/referral/shop', (req, res) => {
  const rewards = [
    {
      id: 1,
      name: '高级会员7天体验',
      description: '享受7天高级会员所有权益',
      points_cost: 200,
      category: 'subscription',
      icon: '👑',
      stock: 100,
      is_available: true
    },
    {
      id: 2,
      name: '专属头像框',
      description: '获得限量版个性头像框',
      points_cost: 150,
      category: 'cosmetic',
      icon: '🖼️',
      stock: 50,
      is_available: true
    },
    {
      id: 3,
      name: '优质内容推荐权',
      description: '您的内容将获得额外推荐机会',
      points_cost: 300,
      category: 'feature',
      icon: '🚀',
      stock: 20,
      is_available: true
    },
    {
      id: 4,
      name: '专属客服通道',
      description: '享受专属客服优先服务',
      points_cost: 400,
      category: 'service',
      icon: '💬',
      stock: 30,
      is_available: true
    },
    {
      id: 5,
      name: '平台商城优惠券',
      description: '获得5元平台消费优惠券',
      points_cost: 100,
      category: 'coupon',
      icon: '🎫',
      stock: 200,
      is_available: true
    }
  ];

  res.json({
    success: true,
    data: rewards
  });
});

// 兑换积分商品
app.post('/api/referral/redeem', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const { reward_id } = req.body;

  // 获取用户积分
  const userPoint = userPoints.find(p => p.user_id === userId);
  if (!userPoint) {
    return res.status(404).json({
      success: false,
      message: '用户积分记录不存在'
    });
  }

  // 模拟商品数据（实际应该从数据库获取）
  const rewards = {
    1: { name: '高级会员7天体验', points_cost: 200, category: 'subscription' },
    2: { name: '专属头像框', points_cost: 150, category: 'cosmetic' },
    3: { name: '优质内容推荐权', points_cost: 300, category: 'feature' },
    4: { name: '专属客服通道', points_cost: 400, category: 'service' },
    5: { name: '平台商城优惠券', points_cost: 100, category: 'coupon' }
  };

  const reward = rewards[reward_id];
  if (!reward) {
    return res.status(404).json({
      success: false,
      message: '商品不存在'
    });
  }

  // 检查积分是否足够
  if (userPoint.available_points < reward.points_cost) {
    return res.status(400).json({
      success: false,
      message: '积分不足',
      required: reward.points_cost,
      available: userPoint.available_points
    });
  }

  // 扣除积分
  userPoint.available_points -= reward.points_cost;
  userPoint.used_points += reward.points_cost;

  // 记录兑换交易
  const transaction = {
    id: nextTransactionId++,
    user_id: userId,
    transaction_type: 'spend',
    points: -reward.points_cost,
    reason: '兑换奖励',
    description: `兑换 ${reward.name}`,
    created_at: new Date()
  };
  pointsTransactions.push(transaction);

  // 记录兑换历史
  const redeemRecord = {
    id: nextRedeemId++,
    user_id: userId,
    reward_type: reward.category,
    reward_name: reward.name,
    points_cost: reward.points_cost,
    status: 'completed',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
    created_at: new Date()
  };
  redeemHistory.push(redeemRecord);

  res.json({
    success: true,
    message: '兑换成功',
    data: {
      redeemed_item: reward,
      remaining_points: userPoint.available_points,
      redeem_record: redeemRecord
    }
  });
});

// 获取兑换历史
app.get('/api/referral/redeem-history', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const userRedeemHistory = redeemHistory.filter(r => r.user_id === userId);

  res.json({
    success: true,
    data: userRedeemHistory
  });
});

// 获取用户等级信息
app.get('/api/referral/levels', (req, res) => {
  const levels = [
    { level: 1, name: '新手会员', required_points: 0, color: '#8c8c8c', benefits: ['基础功能'] },
    { level: 2, name: '铜牌会员', required_points: 500, color: '#cd7f32', benefits: ['基础功能', '积分加成10%'] },
    { level: 3, name: '银牌会员', required_points: 1000, color: '#c0c0c0', benefits: ['基础功能', '积分加成20%', '专属客服'] },
    { level: 4, name: '金牌会员', required_points: 2000, color: '#ffd700', benefits: ['基础功能', '积分加成30%', '专属客服', '内容置顶'] },
    { level: 5, name: '钻石会员', required_points: 5000, color: '#b9f2ff', benefits: ['基础功能', '积分加成50%', '专属客服', '内容置顶', '专属徽章'] }
  ];

  res.json({
    success: true,
    data: levels
  });
});

// ========== 内容交易市场 API ==========

// 获取市场商品列表
app.get('/api/marketplace/products', (req, res) => {
  const { page = 1, limit = 12, category, search, sort = 'featured' } = req.query;

  let filteredProducts = marketplaceProducts.filter(p => p.status === 'active');

  // 分类过滤
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  // 搜索过滤
  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // 排序
  switch (sort) {
    case 'price_low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price_high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'downloads':
      filteredProducts.sort((a, b) => b.download_count - a.download_count);
      break;
    case 'newest':
      filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    default: // featured
      filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  const startIndex = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + parseInt(limit));

  res.json({
    success: true,
    data: {
      products: paginatedProducts,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(filteredProducts.length / limit),
        total_items: filteredProducts.length,
        per_page: parseInt(limit)
      }
    }
  });
});

// 获取商品详情
app.get('/api/marketplace/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = marketplaceProducts.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: '商品不存在'
    });
  }

  // 获取商品评价
  const reviews = productReviews.filter(r => r.product_id === productId);

  // 获取卖家信息
  const seller = users.find(u => u.id === product.seller_id);

  res.json({
    success: true,
    data: {
      product,
      reviews,
      seller: seller ? {
        id: seller.id,
        username: seller.username,
        nickname: seller.nickname
      } : null
    }
  });
});

// 购买商品
app.post('/api/marketplace/buy/:id', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const productId = parseInt(req.params.id);
  const buyerId = auth.user.id;
  const { payment_method = 'balance' } = req.body;

  const product = marketplaceProducts.find(p => p.id === productId && p.status === 'active');
  if (!product) {
    return res.status(404).json({
      success: false,
      message: '商品不存在或已下架'
    });
  }

  if (product.seller_id === buyerId) {
    return res.status(400).json({
      success: false,
      message: '不能购买自己的商品'
    });
  }

  // 检查是否已购买
  const existingOrder = marketplaceOrders.find(o =>
    o.buyer_id === buyerId && o.product_id === productId && o.status === 'completed'
  );
  if (existingOrder) {
    return res.status(400).json({
      success: false,
      message: '您已经购买过这个商品'
    });
  }

  // 检查余额（简化处理）
  const buyer = users.find(u => u.id === buyerId);
  if (!buyer || buyer.balance < product.price) {
    return res.status(400).json({
      success: false,
      message: '余额不足'
    });
  }

  // 创建订单
  const order = {
    id: nextOrderId++,
    buyer_id: buyerId,
    seller_id: product.seller_id,
    product_id: productId,
    quantity: 1,
    unit_price: product.price,
    total_amount: product.price,
    commission_amount: product.price * product.commission_rate,
    status: 'completed',
    payment_method,
    created_at: new Date()
  };
  marketplaceOrders.push(order);

  // 扣除买家余额
  buyer.balance -= product.price;

  // 增加卖家余额（扣除佣金）
  const seller = users.find(u => u.id === product.seller_id);
  if (seller) {
    seller.balance += product.price * (1 - product.commission_rate);
  }

  // 创建交易记录
  const transaction = {
    id: nextMarketTransactionId++,
    order_id: order.id,
    buyer_id: buyerId,
    seller_id: product.seller_id,
    product_id: productId,
    amount: product.price,
    commission: order.commission_amount,
    seller_earnings: product.price * (1 - product.commission_rate),
    transaction_type: 'sale',
    status: 'completed',
    created_at: new Date()
  };
  marketplaceTransactions.push(transaction);

  // 增加下载计数
  product.download_count++;

  res.json({
    success: true,
    message: '购买成功',
    data: {
      order,
      download_url: `/download/${product.id}`,
      transaction
    }
  });
});

// 发布商品
app.post('/api/marketplace/create', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const {
    title,
    description,
    category,
    price,
    original_price,
    content_type,
    file_size,
    preview_content,
    tags
  } = req.body;

  const product = {
    id: nextProductId++,
    seller_id: auth.user.id,
    title,
    description,
    category,
    price: parseFloat(price),
    original_price: parseFloat(original_price || price),
    content_type,
    file_size,
    preview_content,
    tags: tags || [],
    status: 'active',
    featured: false,
    download_count: 0,
    rating: 0,
    review_count: 0,
    commission_rate: 0.1, // 默认10%佣金
    created_at: new Date()
  };

  marketplaceProducts.push(product);

  res.json({
    success: true,
    message: '商品发布成功',
    data: product
  });
});

// 添加商品评价
app.post('/api/marketplace/review/:id', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const productId = parseInt(req.params.id);
  const userId = auth.user.id;
  const { rating, comment } = req.body;

  // 检查是否购买过
  const hasPurchased = marketplaceOrders.find(o =>
    o.buyer_id === userId && o.product_id === productId && o.status === 'completed'
  );

  if (!hasPurchased) {
    return res.status(400).json({
      success: false,
      message: '只有购买过的用户才能评价'
    });
  }

  // 检查是否已评价
  const existingReview = productReviews.find(r =>
    r.product_id === productId && r.user_id === userId
  );

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: '您已经评价过这个商品'
    });
  }

  const review = {
    id: nextReviewId++,
    product_id: productId,
    user_id: userId,
    rating: parseInt(rating),
    comment,
    helpful_count: 0,
    created_at: new Date()
  };

  productReviews.push(review);

  // 更新商品评分
  const product = marketplaceProducts.find(p => p.id === productId);
  if (product) {
    const allReviews = productReviews.filter(r => r.product_id === productId);
    product.rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    product.review_count = allReviews.length;
  }

  res.json({
    success: true,
    message: '评价添加成功',
    data: review
  });
});

// 获取我的订单
app.get('/api/marketplace/orders', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const userOrders = marketplaceOrders.filter(o => o.buyer_id === userId);

  // 获取订单相关的商品信息
  const ordersWithProducts = userOrders.map(order => {
    const product = marketplaceProducts.find(p => p.id === order.product_id);
    return {
      ...order,
      product: product ? {
        title: product.title,
        category: product.category,
        content_type: product.content_type
      } : null
    };
  });

  res.json({
    success: true,
    data: ordersWithProducts
  });
});

// ========== 企业定制化服务 API ==========

// 获取企业服务列表
app.get('/api/enterprise/services', (req, res) => {
  const services = [
    {
      id: 1,
      name: '行业定制报告',
      description: '根据企业需求定制行业分析报告',
      price: 5000,
      duration: '5-10个工作日',
      features: ['深度行业分析', '竞争对手研究', '市场趋势预测', '战略建议'],
      category: 'report'
    },
    {
      id: 2,
      name: '数据采集服务',
      description: '专业数据采集和清洗服务',
      price: 3000,
      duration: '3-7个工作日',
      features: ['多源数据采集', '数据清洗处理', '格式标准化', '质量验证'],
      category: 'data'
    },
    {
      id: 3,
      name: '企业培训方案',
      description: '为企业定制专业培训课程',
      price: 8000,
      duration: '1-2周',
      features: ['需求分析', '课程设计', '讲师派遣', '效果评估'],
      category: 'training'
    }
  ];

  res.json({
    success: true,
    data: services
  });
});

// 申请企业账户
app.post('/api/enterprise/apply', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const {
    company_name,
    contact_person,
    contact_email,
    contact_phone,
    industry,
    company_size,
    requirements
  } = req.body;

  const enterpriseAccount = {
    id: nextEnterpriseId++,
    user_id: auth.user.id,
    company_name,
    contact_person,
    contact_email,
    contact_phone,
    industry,
    company_size,
    requirements,
    status: 'pending',
    created_at: new Date()
  };

  enterpriseAccounts.push(enterpriseAccount);

  res.json({
    success: true,
    message: '企业账户申请提交成功，我们将在1-3个工作日内与您联系',
    data: enterpriseAccount
  });
});

// 生成定制报告
app.post('/api/enterprise/reports', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { title, report_type, data_sources, requirements } = req.body;

  const customReport = {
    id: nextCustomReportId++,
    user_id: auth.user.id,
    title,
    report_type,
    data_sources,
    requirements,
    status: 'processing',
    progress: 10,
    estimated_completion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date()
  };

  customReports.push(customReport);

  res.json({
    success: true,
    message: '定制报告请求已提交',
    data: customReport
  });
});

// 批量导出数据
app.post('/api/enterprise/export', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { data_type, filters, format = 'excel' } = req.body;

  const exportLog = {
    id: nextExportLogId++,
    user_id: auth.user.id,
    data_type,
    filters,
    format,
    status: 'processing',
    file_size: '0MB',
    download_url: null,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    created_at: new Date()
  };

  exportLogs.push(exportLog);

  // 模拟异步处理
  setTimeout(() => {
    exportLog.status = 'completed';
    exportLog.file_size = '12.5MB';
    exportLog.download_url = `/downloads/export_${exportLog.id}.${format}`;
  }, 2000);

  res.json({
    success: true,
    message: '数据导出请求已提交，请稍后下载',
    data: exportLog
  });
});

// 获取企业报告列表
app.get('/api/enterprise/reports', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const userId = auth.user.id;
  const userReports = customReports.filter(r => r.user_id === userId);

  res.json({
    success: true,
    data: userReports
  });
});

// ========== AI风控与内容审核模块 ==========

// AI风控数据存储
let riskControlLogs = [];
let contentModerationQueue = [];
let moderationRules = [];
let aiModels = [];
let securityAlerts = [];

// 管理员权限验证中间件
const requireAdmin = (req, res, next) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  if (auth.user.user_type !== 3) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }

  req.user = auth.user;
  next();
};

// 获取风控概览
app.get('/api/risk-control/overview', requireAdmin, (req, res) => {
  const overview = {
    totalChecks: riskControlLogs.length,
    riskDetections: riskControlLogs.filter(log => log.risk_score > 0.7).length,
    contentModerated: contentModerationQueue.filter(item => item.status === 'processed').length,
    securityAlerts: securityAlerts.filter(alert => alert.status === 'active').length,
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    data: overview
  });
});

// 获取风控日志
app.get('/api/risk-control/logs', requireAdmin, (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;

  let filteredLogs = riskControlLogs;

  if (type) {
    filteredLogs = filteredLogs.filter(log => log.type === type);
  }

  if (status) {
    filteredLogs = filteredLogs.filter(log => log.status === status);
  }

  const total = filteredLogs.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const logs = filteredLogs.slice(offset, offset + parseInt(limit));

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total
      }
    }
  });
});

// 获取内容审核队列
app.get('/api/content-moderation/queue', requireAdmin, (req, res) => {
  const { status } = req.query;

  let filteredQueue = contentModerationQueue;
  if (status) {
    filteredQueue = filteredQueue.filter(item => item.status === status);
  }

  res.json({
    success: true,
    data: filteredQueue
  });
});

// 处理内容审核
app.post('/api/content-moderation/review/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body;

  const item = contentModerationQueue.find(item => item.id === parseInt(id));
  if (!item) {
    return res.status(404).json({
      success: false,
      message: '审核项目不存在'
    });
  }

  item.status = 'processed';
  item.action = action;
  item.reason = reason;
  item.reviewed_by = req.user.id;
  item.reviewed_at = new Date().toISOString();

  res.json({
    success: true,
    data: item
  });
});

// 获取审核规则
app.get('/api/content-moderation/rules', requireAdmin, (req, res) => {
  res.json({
    success: true,
    data: moderationRules
  });
});

// 创建审核规则
app.post('/api/content-moderation/rules', requireAdmin, (req, res) => {
  const { name, type, pattern, action, enabled = true } = req.body;

  const rule = {
    id: moderationRules.length + 1,
    name,
    type,
    pattern,
    action,
    enabled,
    created_by: req.user.id,
    created_at: new Date().toISOString(),
    triggered_count: 0
  };

  moderationRules.push(rule);

  res.json({
    success: true,
    data: rule
  });
});

// 更新审核规则
app.put('/api/content-moderation/rules/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const ruleIndex = moderationRules.findIndex(rule => rule.id === parseInt(id));
  if (ruleIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '规则不存在'
    });
  }

  moderationRules[ruleIndex] = {
    ...moderationRules[ruleIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };

  res.json({
    success: true,
    data: moderationRules[ruleIndex]
  });
});

// 获取AI模型配置
app.get('/api/ai-models', requireAdmin, (req, res) => {
  res.json({
    success: true,
    data: aiModels
  });
});

// 更新AI模型配置
app.put('/api/ai-models/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const modelIndex = aiModels.findIndex(model => model.id === parseInt(id));
  if (modelIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '模型不存在'
    });
  }

  aiModels[modelIndex] = {
    ...aiModels[modelIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };

  res.json({
    success: true,
    data: aiModels[modelIndex]
  });
});

// 获取安全警报
app.get('/api/security/alerts', requireAdmin, (req, res) => {
  const { status } = req.query;

  let filteredAlerts = securityAlerts;
  if (status) {
    filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
  }

  res.json({
    success: true,
    data: filteredAlerts
  });
});

// 处理安全警报
app.post('/api/security/alerts/:id/handle', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { action, notes } = req.body;

  const alert = securityAlerts.find(alert => alert.id === parseInt(id));
  if (!alert) {
    return res.status(404).json({
      success: false,
      message: '警报不存在'
    });
  }

  alert.status = action === 'resolve' ? 'resolved' : 'dismissed';
  alert.handled_by = req.user.id;
  alert.handled_at = new Date().toISOString();
  alert.notes = notes;

  res.json({
    success: true,
    data: alert
  });
});

// 模拟内容检测
app.post('/api/content-moderation/check', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { content, type } = req.body;

  // 模拟AI内容检测
  const riskScore = Math.random();
  const containsSensitive = content.includes('敏感') || content.includes('违规');

  const result = {
    id: Date.now(),
    content_id: `${type}_${Date.now()}`,
    content_type: type,
    content_preview: content.substring(0, 100),
    risk_score: containsSensitive ? 0.9 : riskScore,
    detected_issues: containsSensitive ? ['敏感词汇'] : [],
    ai_confidence: Math.random() * 0.3 + 0.7,
    status: containsSensitive || riskScore > 0.7 ? 'flagged' : 'approved',
    checked_at: new Date().toISOString()
  };

  // 如果检测到风险，添加到审核队列
  if (result.status === 'flagged') {
    contentModerationQueue.push({
      ...result,
      status: 'pending',
      priority: result.risk_score > 0.8 ? 'high' : 'medium'
    });
  }

  // 记录风控日志
  riskControlLogs.push({
    id: Date.now() + 1,
    type: 'content_check',
    content_id: result.content_id,
    user_id: auth.user.id,
    risk_score: result.risk_score,
    status: result.status,
    details: result.detected_issues,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    data: result
  });
});

// 启动服务器
app.listen(PORT, () => {
  initDemoData();
  console.log(`🚀 演示服务器启动成功!`);
  console.log(`📍 后端API: http://localhost:${PORT}`);
  console.log(`💡 健康检查: http://localhost:${PORT}/health`);
  console.log(`📚 演示账号: demo@example.com / 123456`);
  console.log(`⚠️  注意: 当前为演示模式，使用内存存储，重启后数据会丢失`);
});

// 交易购买API
app.post('/api/trades/purchase', (req, res) => {
  // 简单的token验证
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({
      success: false,
      message: '未授权'
    });
  }

  const userId = parseInt(token.split('-')[2]);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  const { informationId, message: tradeMessage } = req.body;
  const info = information.find(i => i.id === parseInt(informationId));

  if (!info) {
    return res.status(404).json({
      success: false,
      message: '信息不存在'
    });
  }

  if (info.user_id === userId) {
    return res.status(400).json({
      success: false,
      message: '不能购买自己发布的信息'
    });
  }

  if (info.info_type === 1) {
    return res.status(400).json({
      success: false,
      message: '免费信息无需购买'
    });
  }

  // 检查余额
  if (user.balance < info.price) {
    return res.status(400).json({
      success: false,
      message: '余额不足'
    });
  }

  // 扣除余额
  user.balance -= info.price;

  // 创建交易记录（简化版）
  const trade = {
    id: Date.now(),
    user_id: userId,
    information_id: parseInt(informationId),
    amount: info.price,
    status: 'completed',
    created_time: new Date()
  };

  res.json({
    success: true,
    message: '购买成功',
    data: {
      trade,
      remainingBalance: user.balance
    }
  });
});

// 用户资料更新API
app.put('/api/users/profile', (req, res) => {
  // 简单的token验证
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('demo-token-')) {
    return res.status(401).json({
      success: false,
      message: '未授权'
    });
  }

  const userId = parseInt(token.split('-')[2]);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  const { nickname, phone, bio } = req.body;

  // 更新用户信息
  if (nickname !== undefined) user.nickname = nickname;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  user.updated_time = new Date();

  const { password_hash, ...userResponse } = user;
  res.json({
    success: true,
    message: '资料更新成功',
    data: {
      user: userResponse
    }
  });
});

// =================== 社区/社群功能 API ===================

// 简单的token验证函数
const verifyToken = (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('demo-token-')) {
    return { success: false, message: '未授权' };
  }

  const userId = parseInt(token.split('-')[2]);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  return { success: true, user, userId };
};

// =================== 帖子 API ===================

// 发表帖子
app.post('/api/posts', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: '标题和内容不能为空' });
  }

  const newPost = {
    id: nextPostId++,
    user_id: auth.userId,
    title,
    content,
    likes: 0,
    views: 0,
    created_at: new Date(),
    updated_at: new Date(),
    status: 'active'
  };

  posts.push(newPost);

  res.status(201).json({
    success: true,
    message: '帖子发表成功',
    data: newPost
  });
});

// 获取帖子列表
app.get('/api/posts', (req, res) => {
  const { page = 1, limit = 20, sort = 'latest' } = req.query;

  let sortedPosts = [...posts.filter(p => p.status === 'active')];

  if (sort === 'hot') {
    sortedPosts = sortedPosts.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
  } else {
    sortedPosts = sortedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  // 添加用户信息
  const postsWithUserInfo = paginatedPosts.map(post => {
    const user = users.find(u => u.id === post.user_id);
    return {
      ...post,
      user: user ? {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar_url: user.avatar_url
      } : null
    };
  });

  res.json({
    success: true,
    data: {
      list: postsWithUserInfo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sortedPosts.length,
        totalPages: Math.ceil(sortedPosts.length / limit)
      }
    }
  });
});

// 获取帖子详情
app.get('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).json({ success: false, message: '帖子不存在' });
  }

  // 增加浏览量
  post.views++;

  // 获取用户信息
  const user = users.find(u => u.id === post.user_id);
  const postWithUserInfo = {
    ...post,
    user: user ? {
      id: user.id,
      username: user.username,
      nickname: user.nickname || user.username,
      avatar_url: user.avatar_url
    } : null
  };

  res.json({
    success: true,
    data: postWithUserInfo
  });
});

// 点赞帖子
app.post('/api/posts/:id/like', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).json({ success: false, message: '帖子不存在' });
  }

  post.likes++;

  // 创建通知
  if (post.user_id !== auth.userId) {
    const notification = {
      id: nextNotificationId++,
      user_id: post.user_id,
      type: 'like',
      content: `${auth.user.nickname || auth.user.username} 赞了您的帖子`,
      is_read: false,
      created_at: new Date()
    };
    notifications.push(notification);
  }

  res.json({
    success: true,
    message: '点赞成功',
    data: { likes: post.likes }
  });
});

// 举报帖子
app.post('/api/posts/:id/report', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const postId = parseInt(req.params.id);
  const { reason } = req.body;

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ success: false, message: '帖子不存在' });
  }

  const report = {
    id: nextReportId++,
    target_type: 'post',
    target_id: postId,
    reporter_id: auth.userId,
    reason,
    created_at: new Date()
  };

  reports.push(report);

  res.json({
    success: true,
    message: '举报提交成功'
  });
});

// =================== 评论 API ===================

// 评论帖子
app.post('/api/posts/:id/comment', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const postId = parseInt(req.params.id);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: '评论内容不能为空' });
  }

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ success: false, message: '帖子不存在' });
  }

  const comment = {
    id: nextCommentId++,
    post_id: postId,
    user_id: auth.userId,
    content,
    created_at: new Date()
  };

  comments.push(comment);

  // 创建通知
  if (post.user_id !== auth.userId) {
    const notification = {
      id: nextNotificationId++,
      user_id: post.user_id,
      type: 'comment',
      content: `${auth.user.nickname || auth.user.username} 评论了您的帖子`,
      is_read: false,
      created_at: new Date()
    };
    notifications.push(notification);
  }

  res.status(201).json({
    success: true,
    message: '评论成功',
    data: comment
  });
});

// 获取帖子评论
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const { page = 1, limit = 20 } = req.query;

  const postComments = comments.filter(c => c.post_id === postId);
  const sortedComments = postComments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedComments = sortedComments.slice(startIndex, endIndex);

  // 添加用户信息
  const commentsWithUserInfo = paginatedComments.map(comment => {
    const user = users.find(u => u.id === comment.user_id);
    return {
      ...comment,
      user: user ? {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar_url: user.avatar_url
      } : null
    };
  });

  res.json({
    success: true,
    data: {
      list: commentsWithUserInfo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: postComments.length,
        totalPages: Math.ceil(postComments.length / limit)
      }
    }
  });
});

// =================== 私信 API ===================

// 发送私信
app.post('/api/messages', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { receiver_id, content } = req.body;

  if (!receiver_id || !content) {
    return res.status(400).json({ success: false, message: '接收方和内容不能为空' });
  }

  const receiver = users.find(u => u.id === parseInt(receiver_id));
  if (!receiver) {
    return res.status(404).json({ success: false, message: '接收方用户不存在' });
  }

  const message = {
    id: nextMessageId++,
    sender_id: auth.userId,
    receiver_id: parseInt(receiver_id),
    content,
    is_read: false,
    created_at: new Date()
  };

  messages.push(message);

  // 创建通知
  const notification = {
    id: nextNotificationId++,
    user_id: parseInt(receiver_id),
    type: 'message',
    content: `${auth.user.nickname || auth.user.username} 给您发送了一条消息`,
    is_read: false,
    created_at: new Date()
  };
  notifications.push(notification);

  res.status(201).json({
    success: true,
    message: '消息发送成功',
    data: message
  });
});

// 获取与某用户的消息记录
app.get('/api/messages/:userId', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const otherUserId = parseInt(req.params.userId);
  const { page = 1, limit = 50 } = req.query;

  const conversation = messages.filter(m =>
    (m.sender_id === auth.userId && m.receiver_id === otherUserId) ||
    (m.sender_id === otherUserId && m.receiver_id === auth.userId)
  );

  const sortedMessages = conversation.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

  // 标记消息为已读
  messages.forEach(m => {
    if (m.receiver_id === auth.userId && m.sender_id === otherUserId) {
      m.is_read = true;
    }
  });

  res.json({
    success: true,
    data: {
      list: paginatedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: conversation.length,
        totalPages: Math.ceil(conversation.length / limit)
      }
    }
  });
});

// 获取消息列表（会话列表）
app.get('/api/messages', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  // 获取所有相关消息
  const userMessages = messages.filter(m =>
    m.sender_id === auth.userId || m.receiver_id === auth.userId
  );

  // 按对话分组
  const conversations = {};
  userMessages.forEach(message => {
    const otherUserId = message.sender_id === auth.userId ? message.receiver_id : message.sender_id;

    if (!conversations[otherUserId]) {
      conversations[otherUserId] = {
        user_id: otherUserId,
        messages: [],
        unread_count: 0
      };
    }

    conversations[otherUserId].messages.push(message);

    if (message.receiver_id === auth.userId && !message.is_read) {
      conversations[otherUserId].unread_count++;
    }
  });

  // 转换为列表并添加用户信息
  const conversationList = Object.values(conversations).map(conv => {
    const user = users.find(u => u.id === conv.user_id);
    const lastMessage = conv.messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return {
      user: user ? {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar_url: user.avatar_url
      } : null,
      last_message: lastMessage,
      unread_count: conv.unread_count
    };
  });

  // 按最后消息时间排序
  conversationList.sort((a, b) => new Date(b.last_message.created_at) - new Date(a.last_message.created_at));

  res.json({
    success: true,
    data: conversationList
  });
});

// =================== 群组 API ===================

// 创建群组
app.post('/api/groups', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: '群组名称不能为空' });
  }

  const group = {
    id: nextGroupId++,
    name,
    description: description || '',
    owner_id: auth.userId,
    created_at: new Date()
  };

  groups.push(group);

  // 添加创建者为群主
  const membership = {
    id: nextGroupMemberId++,
    group_id: group.id,
    user_id: auth.userId,
    role: 'owner',
    joined_at: new Date()
  };
  groupMembers.push(membership);

  res.status(201).json({
    success: true,
    message: '群组创建成功',
    data: group
  });
});

// 获取群组列表
app.get('/api/groups', (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedGroups = groups.slice(startIndex, endIndex);

  // 添加成员数量
  const groupsWithMemberCount = paginatedGroups.map(group => {
    const memberCount = groupMembers.filter(m => m.group_id === group.id).length;
    const owner = users.find(u => u.id === group.owner_id);

    return {
      ...group,
      member_count: memberCount,
      owner: owner ? {
        id: owner.id,
        username: owner.username,
        nickname: owner.nickname || owner.username
      } : null
    };
  });

  res.json({
    success: true,
    data: {
      list: groupsWithMemberCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: groups.length,
        totalPages: Math.ceil(groups.length / limit)
      }
    }
  });
});

// 获取群组详情
app.get('/api/groups/:id', (req, res) => {
  const groupId = parseInt(req.params.id);
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return res.status(404).json({ success: false, message: '群组不存在' });
  }

  // 获取成员列表
  const members = groupMembers
    .filter(m => m.group_id === groupId)
    .map(member => {
      const user = users.find(u => u.id === member.user_id);
      return {
        ...member,
        user: user ? {
          id: user.id,
          username: user.username,
          nickname: user.nickname || user.username,
          avatar_url: user.avatar_url
        } : null
      };
    });

  // 获取群内帖子
  const groupPosts = posts
    .filter(p => p.group_id === groupId && p.status === 'active')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  const owner = users.find(u => u.id === group.owner_id);

  res.json({
    success: true,
    data: {
      ...group,
      member_count: members.length,
      owner: owner ? {
        id: owner.id,
        username: owner.username,
        nickname: owner.nickname || owner.username,
        avatar_url: owner.avatar_url
      } : null,
      members,
      recent_posts: groupPosts
    }
  });
});

// 加入群组
app.post('/api/groups/:id/join', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const groupId = parseInt(req.params.id);
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return res.status(404).json({ success: false, message: '群组不存在' });
  }

  // 检查是否已经是成员
  const existingMember = groupMembers.find(m => m.group_id === groupId && m.user_id === auth.userId);
  if (existingMember) {
    return res.status(400).json({ success: false, message: '您已经是群成员' });
  }

  const membership = {
    id: nextGroupMemberId++,
    group_id: groupId,
    user_id: auth.userId,
    role: 'member',
    joined_at: new Date()
  };

  groupMembers.push(membership);

  res.json({
    success: true,
    message: '加入群组成功'
  });
});

// =================== 通知 API ===================

// 获取通知列表
app.get('/api/notifications', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { page = 1, limit = 20 } = req.query;

  const userNotifications = notifications
    .filter(n => n.user_id === auth.userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      list: paginatedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: userNotifications.length,
        totalPages: Math.ceil(userNotifications.length / limit)
      },
      unread_count: userNotifications.filter(n => !n.is_read).length
    }
  });
});

// 标记通知已读
app.post('/api/notifications/read', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  const { notification_ids } = req.body;

  if (notification_ids && Array.isArray(notification_ids)) {
    // 标记指定通知为已读
    notifications.forEach(notification => {
      if (notification_ids.includes(notification.id) && notification.user_id === auth.userId) {
        notification.is_read = true;
      }
    });
  } else {
    // 标记所有通知为已读
    notifications.forEach(notification => {
      if (notification.user_id === auth.userId) {
        notification.is_read = true;
      }
    });
  }

  res.json({
    success: true,
    message: '标记已读成功'
  });
});

// =================== 排行榜 API ===================

// 用户排行榜
app.get('/api/leaderboard/users', (req, res) => {
  const { type = 'posts' } = req.query; // posts, likes, comments

  let userStats = users.map(user => {
    const userPosts = posts.filter(p => p.user_id === user.id && p.status === 'active');
    const userComments = comments.filter(c => c.user_id === user.id);
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);

    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar_url: user.avatar_url
      },
      post_count: userPosts.length,
      comment_count: userComments.length,
      total_likes: totalLikes,
      score: userPosts.length * 10 + userComments.length * 2 + totalLikes * 5
    };
  });

  // 排序
  switch (type) {
    case 'likes':
      userStats = userStats.sort((a, b) => b.total_likes - a.total_likes);
      break;
    case 'comments':
      userStats = userStats.sort((a, b) => b.comment_count - a.comment_count);
      break;
    default:
      userStats = userStats.sort((a, b) => b.post_count - a.post_count);
  }

  res.json({
    success: true,
    data: userStats.slice(0, 50)
  });
});

// 热门帖子排行榜
app.get('/api/leaderboard/posts', (req, res) => {
  const { type = 'hot', limit = 50 } = req.query;

  let sortedPosts = posts.filter(p => p.status === 'active');

  switch (type) {
    case 'likes':
      sortedPosts = sortedPosts.sort((a, b) => b.likes - a.likes);
      break;
    case 'views':
      sortedPosts = sortedPosts.sort((a, b) => b.views - a.views);
      break;
    default: // hot
      sortedPosts = sortedPosts.sort((a, b) => (b.likes * 5 + b.views) - (a.likes * 5 + a.views));
  }

  // 添加用户信息
  const postsWithUserInfo = sortedPosts.slice(0, parseInt(limit)).map(post => {
    const user = users.find(u => u.id === post.user_id);
    return {
      ...post,
      user: user ? {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar_url: user.avatar_url
      } : null
    };
  });

  res.json({
    success: true,
    data: postsWithUserInfo
  });
});

// =================== 数据分析 API ===================

// 记录用户活动
const logUserActivity = (userId, action, targetType, targetId, metadata = {}) => {
  const activity = {
    id: nextActivityLogId++,
    user_id: userId,
    action, // view, like, comment, purchase, etc.
    target_type: targetType, // post, information, user, etc.
    target_id: targetId,
    metadata,
    created_at: new Date()
  };
  userActivityLogs.push(activity);
};

// 用户分析数据
app.get('/api/analytics/users', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  // 检查管理员权限
  if (auth.user.user_type !== 3) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }

  const { timeRange = '7d' } = req.query;

  // 计算时间范围
  const now = new Date();
  const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 用户活跃度分析
  const activeUsers = userActivityLogs
    .filter(log => new Date(log.created_at) >= startDate)
    .reduce((acc, log) => {
      acc[log.user_id] = (acc[log.user_id] || 0) + 1;
      return acc;
    }, {});

  // 行为分析
  const actionStats = userActivityLogs
    .filter(log => new Date(log.created_at) >= startDate)
    .reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

  // 新增用户统计
  const newUsers = users.filter(user =>
    new Date(user.created_time) >= startDate
  ).length;

  // 用户留存分析
  const totalUsers = users.length;
  const activeUserCount = Object.keys(activeUsers).length;

  const analytics = {
    overview: {
      totalUsers,
      activeUsers: activeUserCount,
      newUsers,
      retentionRate: totalUsers > 0 ? (activeUserCount / totalUsers * 100).toFixed(2) : 0
    },
    userActivity: {
      totalActions: userActivityLogs.filter(log => new Date(log.created_at) >= startDate).length,
      actionBreakdown: actionStats,
      topActiveUsers: Object.entries(activeUsers)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => {
          const user = users.find(u => u.id === parseInt(userId));
          return {
            user: user ? {
              id: user.id,
              username: user.username,
              nickname: user.nickname || user.username
            } : null,
            activityCount: count
          };
        })
    },
    trends: generateUserTrends(startDate, days)
  };

  res.json({
    success: true,
    data: analytics
  });
});

// 内容分析数据
app.get('/api/analytics/posts', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  if (auth.user.user_type !== 3) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }

  const { timeRange = '7d' } = req.query;
  const now = new Date();
  const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 帖子统计
  const totalPosts = posts.length;
  const recentPosts = posts.filter(post => new Date(post.created_at) >= startDate);

  // 热门帖子分析
  const hotPosts = posts
    .map(post => ({
      ...post,
      engagement: post.likes + post.views + (comments.filter(c => c.post_id === post.id).length * 2)
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 10)
    .map(post => {
      const user = users.find(u => u.id === post.user_id);
      const commentCount = comments.filter(c => c.post_id === post.id).length;
      return {
        id: post.id,
        title: post.title,
        likes: post.likes,
        views: post.views,
        comments: commentCount,
        engagement: post.engagement,
        author: user ? user.nickname || user.username : '未知用户',
        created_at: post.created_at
      };
    });

  // 内容类型分析
  const postsByDate = recentPosts.reduce((acc, post) => {
    const date = new Date(post.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const analytics = {
    overview: {
      totalPosts,
      recentPosts: recentPosts.length,
      totalViews: posts.reduce((sum, post) => sum + post.views, 0),
      totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
      totalComments: comments.length,
      averageEngagement: totalPosts > 0 ?
        (posts.reduce((sum, post) => sum + post.likes + post.views, 0) / totalPosts).toFixed(2) : 0
    },
    hotPosts,
    trends: {
      postsPerDay: postsByDate,
      engagementTrend: generateEngagementTrend(startDate, days)
    }
  };

  res.json({
    success: true,
    data: analytics
  });
});

// 交易分析数据
app.get('/api/analytics/transactions', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  if (auth.user.user_type !== 3) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }

  const { timeRange = '7d' } = req.query;
  const now = new Date();
  const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 模拟交易数据（基于现有用户和信息）
  const simulatedTransactions = generateTransactionData(startDate, days);

  const totalRevenue = simulatedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = simulatedTransactions.length;

  // 热销信息分析
  const topSelling = information
    .filter(info => info.info_type === 2) // 付费内容
    .map(info => ({
      id: info.id,
      title: info.title,
      price: info.price,
      sales: Math.floor(Math.random() * 20) + 1, // 模拟销量
      revenue: 0
    }))
    .map(item => ({
      ...item,
      revenue: item.sales * item.price
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const analytics = {
    overview: {
      totalRevenue: totalRevenue.toFixed(2),
      totalTransactions,
      averageOrderValue: totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : 0,
      conversionRate: users.length > 0 ? ((totalTransactions / users.length) * 100).toFixed(2) : 0
    },
    topSelling,
    trends: {
      dailyRevenue: generateRevenueTrend(startDate, days),
      transactionVolume: generateTransactionTrend(startDate, days)
    },
    userStats: {
      payingUsers: Math.floor(users.length * 0.1), // 假设10%的用户付费
      freeUsers: Math.floor(users.length * 0.9)
    }
  };

  res.json({
    success: true,
    data: analytics
  });
});

// 导出报表
app.get('/api/analytics/export', (req, res) => {
  const auth = verifyToken(req, res);
  if (!auth.success) {
    return res.status(401).json({ success: false, message: auth.message });
  }

  if (auth.user.user_type !== 3) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }

  const { type = 'users', format = 'json' } = req.query;

  let data = {};
  switch (type) {
    case 'users':
      data = {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          user_type: user.user_type,
          balance: user.balance,
          created_time: user.created_time,
          status: user.status
        })),
        total: users.length
      };
      break;
    case 'posts':
      data = {
        posts: posts.map(post => ({
          id: post.id,
          title: post.title,
          likes: post.likes,
          views: post.views,
          created_at: post.created_at,
          author_id: post.user_id
        })),
        total: posts.length
      };
      break;
    case 'transactions':
      data = {
        transactions: generateTransactionData(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 30),
        total: generateTransactionData(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 30).length
      };
      break;
  }

  if (format === 'csv') {
    // 简化的CSV导出
    let csv = '';
    if (type === 'users') {
      csv = 'ID,Username,Email,Type,Balance,Created\n';
      data.users.forEach(user => {
        csv += `${user.id},${user.username},${user.email},${user.user_type},${user.balance},${user.created_time}\n`;
      });
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_export.csv"`);
    res.send(csv);
  } else {
    res.json({
      success: true,
      data,
      exportTime: new Date().toISOString()
    });
  }
});

// 辅助函数
function generateUserTrends(startDate, days) {
  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(startDate.getTime() + (days - 1 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const dayActivities = userActivityLogs.filter(log => {
      const logDate = new Date(log.created_at).toISOString().split('T')[0];
      return logDate === dateStr;
    });

    trends.push({
      date: dateStr,
      activeUsers: new Set(dayActivities.map(log => log.user_id)).size,
      totalActivities: dayActivities.length
    });
  }
  return trends;
}

function generateEngagementTrend(startDate, days) {
  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(startDate.getTime() + (days - 1 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const dayPosts = posts.filter(post => {
      const postDate = new Date(post.created_at).toISOString().split('T')[0];
      return postDate === dateStr;
    });

    const engagement = dayPosts.reduce((sum, post) => sum + post.likes + post.views, 0);

    trends.push({
      date: dateStr,
      posts: dayPosts.length,
      engagement
    });
  }
  return trends;
}

function generateTransactionData(startDate, days) {
  const transactions = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dailyTransactions = Math.floor(Math.random() * 5) + 1;

    for (let j = 0; j < dailyTransactions; j++) {
      transactions.push({
        id: transactions.length + 1,
        user_id: Math.floor(Math.random() * users.length) + 1,
        information_id: Math.floor(Math.random() * information.length) + 1,
        amount: Math.random() * 100 + 10,
        created_at: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
      });
    }
  }
  return transactions;
}

function generateRevenueTrend(startDate, days) {
  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(startDate.getTime() + (days - 1 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const revenue = Math.random() * 500 + 100;

    trends.push({
      date: dateStr,
      revenue: parseFloat(revenue.toFixed(2))
    });
  }
  return trends;
}

function generateTransactionTrend(startDate, days) {
  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(startDate.getTime() + (days - 1 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const count = Math.floor(Math.random() * 20) + 5;

    trends.push({
      date: dateStr,
      count
    });
  }
  return trends;
}

module.exports = app;