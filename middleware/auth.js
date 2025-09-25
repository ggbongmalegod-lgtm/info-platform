const Encryption = require('../utils/encryption');
const ApiResponse = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json(
        ApiResponse.error('访问被拒绝，需要提供有效的令牌', 401)
      );
    }

    const decoded = Encryption.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(
      ApiResponse.error('无效的令牌', 401)
    );
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        ApiResponse.error('权限不足', 403)
      );
    }
    next();
  };
};

module.exports = authMiddleware;
module.exports.roleMiddleware = roleMiddleware;