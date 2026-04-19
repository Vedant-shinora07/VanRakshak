// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — JWT Authentication Middleware
// Extracts and verifies the Bearer token from the Authorization header.
// ─────────────────────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';

/**
 * Express middleware that authenticates incoming requests using a JWT
 * Bearer token.
 *
 * On success, attaches the decoded payload to `req.user` with the shape:
 *   { userId, role, name }
 *
 * On failure, responds with 401 Unauthorized.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ✓ FILE COMPLETE: middleware/auth.js
