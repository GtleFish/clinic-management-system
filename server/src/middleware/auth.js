const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Không có token xác thực' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { idUser, role, username }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

/**
 * Middleware kiểm tra role
 * Dùng: authorize('admin') hoặc authorize('admin', 'bacsi')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };