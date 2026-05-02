const express = require('express');

const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const USER_SCOPE = 'user';
const ADMIN_SCOPE = 'admin';

const adminRoles = new Set(['admin', 'communication_admin']);

const getPool = (req) => req.app.locals.db;

const getWebSocket = (req) => req.app.locals.websocket || null;

const isAdminLike = async (req, userId) => {
  const db = getPool(req);
  const result = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);

  if (result.rowCount === 0) {
    return false;
  }

  return adminRoles.has(result.rows[0].role);
};

const normalizeScope = (scope, role) => {
  if (scope === ADMIN_SCOPE || scope === USER_SCOPE) {
    return scope;
  }

  return adminRoles.has(role) ? ADMIN_SCOPE : USER_SCOPE;
};

const mapUserNotification = (row) => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  title: row.title,
  message: row.message,
  read: row.is_read,
  createdAt: row.created_at
});

const mapAdminNotification = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  message: row.message,
  userId: row.target_user_id,
  priority: row.priority,
  read: row.is_read,
  createdAt: row.created_at
});

const mapNotificationForSocket = (notification, scope) => ({
  ...notification,
  scope
});

const ensureScopeAccess = async (req, userId, scope) => {
  if (scope === ADMIN_SCOPE && !(await isAdminLike(req, userId))) {
    return false;
  }

  return true;
};

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = getPool(req);
    const roleResult = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const role = roleResult.rows[0]?.role || 'guest';
    const scope = normalizeScope(req.query.scope, role);

    if (!(await ensureScopeAccess(req, userId, scope))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const readFilter = req.query.read;
    const typeFilter = req.query.type;

    if (scope === USER_SCOPE) {
      const params = [userId];
      const where = ['user_id = $1'];

      if (readFilter !== undefined) {
        where.push(`is_read = $${params.length + 1}`);
        params.push(readFilter === 'true');
      }

      if (typeFilter) {
        where.push(`type = $${params.length + 1}`);
        params.push(typeFilter);
      }

      const [notificationsResult, unreadResult] = await Promise.all([
        db.query(
          `
            SELECT id, user_id, type, title, message, is_read, created_at
            FROM user_notifications
            WHERE ${where.join(' AND ')}
            ORDER BY created_at DESC
          `,
          params
        ),
        db.query(
          `SELECT COUNT(*)::int AS unread_count FROM user_notifications WHERE user_id = $1 AND is_read = false`,
          [userId]
        )
      ]);

      return res.json({
        scope,
        notifications: notificationsResult.rows.map(mapUserNotification),
        total: notificationsResult.rows.length,
        unreadCount: unreadResult.rows[0]?.unread_count || 0
      });
    }

    const params = [];
    const where = [];

    if (readFilter !== undefined) {
      where.push(`is_read = $${params.length + 1}`);
      params.push(readFilter === 'true');
    }

    if (typeFilter) {
      where.push(`type = $${params.length + 1}`);
      params.push(typeFilter);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const [notificationsResult, unreadResult] = await Promise.all([
      db.query(
        `
          SELECT
            id,
            type,
            title,
            message,
            target_user_id,
            priority,
            is_read,
            created_at
          FROM admin_notifications
          ${whereClause}
          ORDER BY created_at DESC
        `,
        params
      ),
      db.query(`SELECT COUNT(*)::int AS unread_count FROM admin_notifications WHERE is_read = false`)
    ]);

    return res.json({
      scope,
      notifications: notificationsResult.rows.map(mapAdminNotification),
      total: notificationsResult.rows.length,
      unreadCount: unreadResult.rows[0]?.unread_count || 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = getPool(req);
    const roleResult = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const role = roleResult.rows[0]?.role || 'guest';
    const scope = normalizeScope(req.body?.scope, role);
    const websocket = getWebSocket(req);

    if (!(await ensureScopeAccess(req, userId, scope))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (scope === USER_SCOPE) {
      const targetUserId = req.body?.userId ? parseInt(req.body.userId, 10) : userId;
      if (Number.isNaN(targetUserId)) {
        return res.status(400).json({ message: 'Invalid user id' });
      }

      if (targetUserId !== userId && !(await isAdminLike(req, userId))) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { type, title, message } = req.body || {};
      const result = await db.query(
        `
          INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
          VALUES ($1, $2, $3, $4, false, NOW())
          RETURNING id, user_id, type, title, message, is_read, created_at
        `,
        [
          targetUserId,
          type || 'general',
          title || 'Notification',
          message || ''
        ]
      );

      const notification = mapUserNotification(result.rows[0]);
      if (websocket && targetUserId) {
        websocket.sendToUser(targetUserId, 'notification', mapNotificationForSocket(notification, scope));
      }

      return res.status(201).json({
        message: 'Notification created successfully',
        notification,
        scope
      });
    }

    const targetUserId = req.body?.userId ? parseInt(req.body.userId, 10) : null;
    if (req.body?.userId && Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const { type, title, message, priority } = req.body || {};
    const result = await db.query(
      `
        INSERT INTO admin_notifications (
          type,
          title,
          message,
          target_user_id,
          priority,
          is_read,
          created_at
        )
        VALUES ($1, $2, $3, $4, COALESCE($5, 'medium'), false, NOW())
        RETURNING id, type, title, message, target_user_id, priority, is_read, created_at
      `,
      [
        type || 'general',
        title || 'Notification',
        message || '',
        targetUserId,
        priority || 'medium'
      ]
    );

    const notification = mapAdminNotification(result.rows[0]);
    if (websocket) {
      if (targetUserId) {
        websocket.sendToUser(targetUserId, 'notification', mapNotificationForSocket(notification, scope));
      } else {
        websocket.broadcast('notification', mapNotificationForSocket(notification, scope));
      }
    }

    return res.status(201).json({
      message: 'Notification created successfully',
      notification,
      scope
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = getPool(req);
    const roleResult = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const role = roleResult.rows[0]?.role || 'guest';
    const scope = normalizeScope(req.body?.scope || req.query.scope, role);

    if (!(await ensureScopeAccess(req, userId, scope))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (scope === USER_SCOPE) {
      const result = await db.query(
        `
          UPDATE user_notifications
          SET is_read = true
          WHERE user_id = $1 AND is_read = false
          RETURNING id
        `,
        [userId]
      );

      return res.json({
        message: 'All notifications marked as read',
        updatedCount: result.rowCount,
        scope
      });
    }

    const result = await db.query(
      `
        UPDATE admin_notifications
        SET is_read = true
        WHERE is_read = false
        RETURNING id
      `
    );

    return res.json({
      message: 'All notifications marked as read',
      updatedCount: result.rowCount,
      scope
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ message: 'Failed to update notifications', error: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const notificationId = parseInt(req.params.id, 10);
    if (Number.isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const db = getPool(req);
    const roleResult = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const role = roleResult.rows[0]?.role || 'guest';
    const scope = normalizeScope(req.query.scope || req.body?.scope, role);

    if (!(await ensureScopeAccess(req, userId, scope))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (scope === USER_SCOPE) {
      const result = await db.query(
        `
          UPDATE user_notifications
          SET is_read = true
          WHERE id = $1 AND user_id = $2
          RETURNING id, user_id, type, title, message, is_read, created_at
        `,
        [notificationId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      return res.json({
        message: 'Notification marked as read',
        notification: mapUserNotification(result.rows[0]),
        scope
      });
    }

    const result = await db.query(
      `
        UPDATE admin_notifications
        SET is_read = true
        WHERE id = $1
        RETURNING id, type, title, message, target_user_id, priority, is_read, created_at
      `,
      [notificationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json({
      message: 'Notification marked as read',
      notification: mapAdminNotification(result.rows[0]),
      scope
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Failed to update notification', error: error.message });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const notificationId = parseInt(req.params.id, 10);
    if (Number.isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const db = getPool(req);
    const roleResult = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const role = roleResult.rows[0]?.role || 'guest';
    const scope = normalizeScope(req.query.scope || req.body?.scope, role);

    if (!(await ensureScopeAccess(req, userId, scope))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (scope === USER_SCOPE) {
      const result = await db.query(
        `
          DELETE FROM user_notifications
          WHERE id = $1 AND user_id = $2
          RETURNING id
        `,
        [notificationId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      return res.json({ message: 'Notification deleted successfully', scope });
    }

    const result = await db.query(
      `
        DELETE FROM admin_notifications
        WHERE id = $1
        RETURNING id
      `,
      [notificationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json({ message: 'Notification deleted successfully', scope });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
});

module.exports = router;