const jwt = require('jsonwebtoken');

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

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
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

/**
 * RBAC: kiểm tra role (không phân biệt hoa thường).
 * Role admin luôn được phép trên mọi route dùng authorize().
 */
const authorize = (...roles) => {
  const allowed = roles.map((r) => normalizeRole(r));
  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    if (userRole === 'admin') {
      return next();
    }
    if (allowed.includes(userRole)) {
      return next();
    }
    return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' });
  };
};

module.exports = { authenticate, authorize, normalizeRole };