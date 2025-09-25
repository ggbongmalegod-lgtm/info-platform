# 信息差平台后端API

## 项目简介

信息差平台后端是一个基于Node.js和Express框架构建的RESTful API服务，为信息差交易平台提供完整的后端功能支持。平台允许用户发布、搜索、购买和销售各类信息内容，并提供完整的交易流程管理。

## 主要功能

### 用户管理
- 用户注册、登录、认证
- 个人资料管理
- 账户余额管理
- 用户角色控制（买家/卖家/双重角色）

### 信息管理
- 信息发布、编辑、删除
- 信息分类和标签
- 信息搜索和筛选
- 信息浏览和推荐

### 交易系统
- 信息购买流程
- 余额支付系统
- 交易记录管理
- 退款处理
- 评分和评价系统

### 权限控制
- JWT身份认证
- 角色权限管理
- API访问控制

## 技术栈

- **运行环境**: Node.js
- **Web框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **身份认证**: JWT (JSON Web Tokens)
- **密码加密**: bcryptjs
- **数据验证**: Joi
- **安全防护**: Helmet, CORS, Rate Limiting

## 项目结构

```
backend/
├── api/                    # API路由
│   ├── auth.js            # 认证相关API
│   ├── users.js           # 用户管理API
│   ├── information.js     # 信息管理API
│   └── trades.js          # 交易管理API
├── config/                # 配置文件
│   ├── config.js         # 应用配置
│   └── database.js       # 数据库连接
├── middleware/            # 中间件
│   ├── auth.js           # 认证中间件
│   └── errorHandler.js   # 错误处理中间件
├── models/               # 数据模型
│   ├── User.js          # 用户模型
│   ├── Information.js   # 信息模型
│   └── Trade.js         # 交易模型
├── services/            # 业务逻辑服务
│   ├── userService.js   # 用户服务
│   ├── informationService.js # 信息服务
│   └── tradeService.js  # 交易服务
├── utils/               # 工具函数
│   ├── response.js      # 统一响应格式
│   ├── validation.js    # 数据验证
│   └── encryption.js    # 加密工具
├── app.js              # 应用入口
└── package.json        # 项目依赖
```

## 安装和运行

### 环境要求
- Node.js >= 14.0.0
- MongoDB >= 4.0

### 安装依赖
```bash
npm install
```

### 环境变量配置
创建 `.env` 文件并配置以下环境变量：

```env
# 服务器配置
PORT=3000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/information_gap

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# 邮件配置（可选）
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

### 启动服务

#### 开发模式
```bash
npm run dev
```

#### 生产模式
```bash
npm start
```

### 健康检查
服务启动后，访问 `http://localhost:3000/health` 检查服务状态。

## API文档

### 基础URL
```
http://localhost:3000/api
```

### 认证相关 (`/auth`)

#### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456",
  "phone": "13800138000",
  "role": "buyer"
}
```

#### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

#### 忘记密码
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

#### 重置密码
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "test@example.com",
  "resetCode": "ABC123",
  "newPassword": "newpassword"
}
```

### 用户管理 (`/users`)

所有用户API需要在请求头中包含认证token：
```http
Authorization: Bearer <your-jwt-token>
```

#### 获取用户信息
```http
GET /users/profile
```

#### 更新用户信息
```http
PUT /users/profile
Content-Type: application/json

{
  "username": "newusername",
  "phone": "13900139000",
  "bio": "用户简介"
}
```

#### 获取余额信息
```http
GET /users/balance
```

#### 账户充值
```http
POST /users/recharge
Content-Type: application/json

{
  "amount": 100,
  "paymentMethod": "alipay"
}
```

### 信息管理 (`/information`)

#### 获取信息列表
```http
GET /information?page=1&limit=20&category=business&search=关键词
```

支持的查询参数：
- `page`: 页码
- `limit`: 每页数量
- `category`: 分类
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `tags`: 标签（用逗号分隔）
- `search`: 搜索关键词
- `sortBy`: 排序字段（price/popularity/rating/newest）
- `sortOrder`: 排序方向（asc/desc）

#### 获取信息详情
```http
GET /information/:id
```

#### 发布信息（需要认证）
```http
POST /information
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "信息标题",
  "description": "信息描述",
  "category": "business",
  "price": 99.99,
  "tags": ["标签1", "标签2"],
  "content": "完整信息内容",
  "previewContent": "预览内容",
  "isPrivate": false
}
```

#### 更新信息（需要认证）
```http
PUT /information/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "更新后的标题",
  "price": 199.99
}
```

#### 删除信息（需要认证）
```http
DELETE /information/:id
Authorization: Bearer <your-jwt-token>
```

#### 获取我发布的信息（需要认证）
```http
GET /information/my/published?page=1&status=active
Authorization: Bearer <your-jwt-token>
```

### 交易管理 (`/trades`)

所有交易API需要认证。

#### 购买信息
```http
POST /trades/purchase
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "informationId": "信息ID",
  "message": "给卖家的留言"
}
```

#### 获取购买记录
```http
GET /trades/my-purchases?page=1&status=completed
Authorization: Bearer <your-jwt-token>
```

#### 获取销售记录
```http
GET /trades/my-sales?page=1&status=completed
Authorization: Bearer <your-jwt-token>
```

#### 获取交易详情
```http
GET /trades/:id
Authorization: Bearer <your-jwt-token>
```

#### 申请退款
```http
POST /trades/:id/refund
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "reason": "退款原因"
}
```

#### 交易评分
```http
POST /trades/:id/rate
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "评价内容"
}
```

## 错误处理

API使用统一的错误响应格式：

```json
{
  "success": false,
  "code": 400,
  "message": "错误描述",
  "data": null,
  "timestamp": "2023-09-23T10:00:00.000Z"
}
```

## 状态码说明

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `500`: 服务器内部错误

## 业务规则

### 交易流程
1. 买家浏览信息列表
2. 买家查看信息详情（未购买时只能看到预览内容）
3. 买家发起购买（扣除账户余额）
4. 交易自动完成（买家可查看完整内容）
5. 卖家获得收益（扣除平台佣金）

### 退款政策
- 24小时内：全额退款
- 7天内：50%退款
- 超过7天：不支持退款

### 平台佣金
- 平台收取5%的交易佣金

## 开发和部署

### 开发
1. 克隆项目
2. 安装依赖：`npm install`
3. 配置环境变量
4. 启动开发服务器：`npm run dev`

### 测试
```bash
npm test
```

### 生产部署
1. 设置生产环境变量
2. 构建项目：`npm run build`（如需要）
3. 启动服务：`npm start`

## 注意事项

1. **安全性**:
   - 所有密码都经过bcrypt加密
   - 使用JWT进行身份认证
   - 实施了API限流保护

2. **数据验证**:
   - 所有输入数据都经过Joi验证
   - 防止SQL注入和XSS攻击

3. **错误处理**:
   - 统一的错误处理机制
   - 详细的错误日志记录

4. **性能优化**:
   - 数据库查询优化
   - 分页查询支持
   - 适当的数据库索引

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 许可证

MIT License

## 联系方式

如有问题，请联系开发团队。