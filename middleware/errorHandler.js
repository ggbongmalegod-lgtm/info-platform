const ApiResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json(
      ApiResponse.error('数据验证错误', 400, err.message)
    );
  }

  if (err.name === 'CastError') {
    return res.status(400).json(
      ApiResponse.error('无效的数据格式', 400)
    );
  }

  if (err.code === 11000) {
    return res.status(409).json(
      ApiResponse.error('数据已存在', 409)
    );
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponse.error('无效的令牌', 401)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.error('令牌已过期', 401)
    );
  }

  return res.status(500).json(
    ApiResponse.error('服务器内部错误', 500)
  );
};

module.exports = errorHandler;