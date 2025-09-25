const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);

    console.log(`MongoDB连接成功: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB连接错误:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB连接断开');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB连接已关闭');
      process.exit(0);
    });

  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

module.exports = connectDB;