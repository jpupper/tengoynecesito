const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fullscreen_secret_2026';

function authMiddleware(req, res, next) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Fallback: check query param (for SSO redirect)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalido o expirado' });
  }
}

module.exports = authMiddleware;
