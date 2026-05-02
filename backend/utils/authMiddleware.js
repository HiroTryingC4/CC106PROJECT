/**
 * Shared authentication middleware for all backend routes.
 * Eliminates copy-pasted getAuthUserId / getUserRole across route files.
 */

/**
 * Parses the authenticated user ID from the request.
 * Supports both Bearer token (token_<id>_<ts>) and session cookie.
 * @param {import('express').Request} req
 * @returns {number|null}
 */
const getAuthUserId = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    const parsedId = parseInt(token.split('_')[1], 10);
    if (!Number.isNaN(parsedId)) return parsedId;
  }

  if (req.session?.userId) return req.session.userId;

  return null;
};

/**
 * Middleware: requires a valid authenticated user.
 * Sets req.userId on success.
 */
const requireAuth = (req, res, next) => {
  const userId = getAuthUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'No authentication provided' });
  }
  req.userId = userId;
  return next();
};

/**
 * Fetches the role of a user from the database.
 * @param {import('pg').Pool} pool - Database connection pool
 * @param {number} userId - User ID
 * @returns {Promise<string|null>} User role or null if not found
 */
const getUserRole = async (pool, userId) => {
  const result = await pool.query('SELECT role FROM users WHERE id = $1 LIMIT 1', [userId]);
  return result.rows[0]?.role || null;
};

/**
 * Middleware factory: requires the authenticated user to have one of the given roles.
 * Fetches role from DB once per request and sets req.userRole.
 * @param {...string} roles - allowed roles e.g. 'host', 'admin'
 */
const requireRole = (...roles) => async (req, res, next) => {
  try {
    const userId = req.userId || getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = req.app.locals.db;
    const role = await getUserRole(pool, userId);

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.userId = userId;
    req.userRole = role;
    return next();
  } catch (err) {
    console.error('requireRole error:', err);
    return res.status(500).json({ message: 'Authorization check failed' });
  }
};

module.exports = { getAuthUserId, getUserRole, requireAuth, requireRole };
