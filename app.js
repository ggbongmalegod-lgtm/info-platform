const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const connectDB = require('./config/database');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const userRoutes = require('./api/users');
const infoRoutes = require('./api/information');
const tradeRoutes = require('./api/trades');
const authRoutes = require('./api/auth');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: '请求过于频繁，请稍后再试'
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/information', infoRoutes);
app.use('/api/trades', authMiddleware, tradeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

connectDB();

const PORT = process.env.PORT || config.port || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;