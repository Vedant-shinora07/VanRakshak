// ─────────────────────────────────────────────────────────────────────────────
// VanRakshak — Role-Based Access Control Middleware
// Restricts route access to specific user roles.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Middleware factory that restricts access to the specified roles.
 *
 * Must be placed **after** the auth middleware so that `req.user` is populated.
 *
 * @param  {...string} roles - Allowed roles, e.g. 'admin', 'harvester', 'depot_manager'.
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.post('/dispatch', authMiddleware, requireRole('depot_manager'), handler);
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
}

// ✓ FILE COMPLETE: middleware/roleCheck.js
