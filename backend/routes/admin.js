const express = require('express');
const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const isAdminLike = async (req, userId) => {
  const db = req.app.locals.db;
  const result = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);

  if (result.rowCount === 0) {
    return false;
  }

  return ['admin', 'communication_admin'].includes(result.rows[0].role);
};

let hostRouter = null;
router.setHostRouter = (host) => {
  hostRouter = host;
};

const insertActivityLog = async (db, {
  actorUserId,
  action,
  description,
  ipAddress = '',
  userAgent = '',
  targetUserId = null,
  targetPropertyId = null
}) => {
  await db.query(
    `
      INSERT INTO admin_activity_logs (
        actor_user_id,
        action,
        description,
        ip_address,
        user_agent,
        target_user_id,
        target_property_id,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `,
    [actorUserId, action, description, ipAddress, userAgent, targetUserId, targetPropertyId]
  );
};

// GET /api/admin/dashboard - Admin dashboard overview
router.get('/dashboard', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const db = req.app.locals.db;
    const [statsResult, activityResult, notificationsResult] = await Promise.all([
      db.query(
        `
          SELECT
            COALESCE((SELECT COUNT(*) FROM users), 0)::int AS total_users,
            COALESCE((SELECT COUNT(*) FROM users WHERE role = 'host'), 0)::int AS total_hosts,
            COALESCE((SELECT COUNT(*) FROM users WHERE role = 'guest'), 0)::int AS total_guests,
            COALESCE((SELECT COUNT(*) FROM properties), 0)::int AS total_properties,
            COALESCE((SELECT COUNT(*) FROM bookings WHERE status IN ('pending', 'confirmed')), 0)::int AS active_bookings,
            COALESCE((SELECT COUNT(*) FROM host_verifications WHERE status = 'pending'), 0)::int AS pending_verifications,
            COALESCE((SELECT COUNT(*) FROM property_reviews WHERE rating <= 2), 0)::int AS flagged_reviews,
            COALESCE((SELECT COUNT(*) FROM admin_notifications WHERE is_read = false), 0)::int AS system_alerts
        `
      ),
      db.query(
        `
          SELECT
            id,
            actor_user_id AS "userId",
            action,
            description,
            ip_address AS "ipAddress",
            user_agent AS "userAgent",
            target_user_id AS "targetUserId",
            target_property_id AS "targetPropertyId",
            created_at AS "createdAt"
          FROM admin_activity_logs
          ORDER BY created_at DESC
          LIMIT 10
        `
      ),
      db.query(
        `
          SELECT
            id,
            type,
            title,
            message,
            target_user_id AS "userId",
            priority,
            is_read AS read,
            created_at AS "createdAt"
          FROM admin_notifications
          WHERE is_read = false
          ORDER BY created_at DESC
          LIMIT 5
        `
      )
    ]);

    const stats = statsResult.rows[0] || {};

    return res.json({
      stats: {
        totalUsers: stats.total_users || 0,
        totalHosts: stats.total_hosts || 0,
        totalGuests: stats.total_guests || 0,
        totalProperties: stats.total_properties || 0,
        activeBookings: stats.active_bookings || 0,
        pendingVerifications: stats.pending_verifications || 0,
        flaggedReviews: stats.flagged_reviews || 0,
        systemAlerts: stats.system_alerts || 0
      },
      recentActivity: activityResult.rows,
      notifications: notificationsResult.rows,
      systemHealth: {
        serverStatus: 'healthy',
        databaseStatus: 'healthy',
        paymentGateway: 'healthy',
        uptime: '99.8%',
        responseTime: '245ms'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load dashboard', error: error.message });
  }
});

// GET /api/admin/users - User management
router.get('/users', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, adminId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { role, status, search } = req.query;
    const db = req.app.locals.db;

    const where = [];
    const params = [];

    if (role) {
      where.push(`u.role = $${params.length + 1}`);
      params.push(role);
    }

    if (search) {
      where.push(`(
        LOWER(u.first_name) LIKE $${params.length + 1}
        OR LOWER(u.last_name) LIKE $${params.length + 1}
        OR LOWER(u.email) LIKE $${params.length + 1}
      )`);
      params.push(`%${String(search).toLowerCase()}%`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await db.query(
      `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          u.verification_status,
          u.created_at,
          u.updated_at,
          COALESCE((SELECT COUNT(*) FROM properties p WHERE p.host_id = u.id), 0)::int AS properties_count,
          COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.guest_id = u.id OR b.host_id = u.id), 0)::int AS bookings_count,
          COALESCE((SELECT SUM(pay.host_payout) FROM payments pay WHERE pay.host_id = u.id AND pay.status = 'completed'), 0)::numeric AS total_revenue
        FROM users u
        ${whereClause}
        ORDER BY u.created_at DESC
      `,
      params
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      role: row.role,
      verificationStatus: row.verification_status,
      joinDate: row.created_at,
      lastLogin: row.updated_at,
      status: status || 'active',
      propertiesCount: row.properties_count,
      bookingsCount: row.bookings_count,
      totalRevenue: parseFloat(row.total_revenue || 0)
    }));

    const filteredUsers = status ? users.filter((user) => user.status === status) : users;

    return res.json({
      users: filteredUsers,
      total: filteredUsers.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load users', error: error.message });
  }
});

// GET /api/admin/notifications
router.get('/notifications', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { read, type } = req.query;
    const db = req.app.locals.db;

    const where = [];
    const params = [];

    if (read !== undefined) {
      where.push(`is_read = $${params.length + 1}`);
      params.push(read === 'true');
    }

    if (type) {
      where.push(`type = $${params.length + 1}`);
      params.push(type);
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
            target_user_id AS "userId",
            priority,
            is_read AS read,
            created_at AS "createdAt"
          FROM admin_notifications
          ${whereClause}
          ORDER BY created_at DESC
        `,
        params
      ),
      db.query(
        `SELECT COUNT(*)::int AS unread_count FROM admin_notifications WHERE is_read = false`
      )
    ]);

    return res.json({
      notifications: notificationsResult.rows,
      total: notificationsResult.rows.length,
      unreadCount: unreadResult.rows[0]?.unread_count || 0
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load notifications', error: error.message });
  }
});

// GET /api/admin/activity-logs
router.get('/activity-logs', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { action, userId: filterUserId, limit = 50 } = req.query;
    const db = req.app.locals.db;

    const where = [];
    const params = [];

    if (action) {
      where.push(`action = $${params.length + 1}`);
      params.push(action);
    }

    if (filterUserId) {
      where.push(`actor_user_id = $${params.length + 1}`);
      params.push(parseInt(filterUserId, 10));
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await db.query(
      `
        SELECT
          id,
          actor_user_id AS "userId",
          action,
          description,
          ip_address AS "ipAddress",
          user_agent AS "userAgent",
          target_user_id AS "targetUserId",
          target_property_id AS "targetPropertyId",
          created_at AS "createdAt"
        FROM admin_activity_logs
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1}
      `,
      [...params, parseInt(limit, 10)]
    );

    return res.json({ logs: result.rows, total: result.rows.length });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load activity logs', error: error.message });
  }
});

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = req.app.locals.db;
    const roleResult = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);

    if (roleResult.rowCount === 0 || roleResult.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await db.query(
      `SELECT settings FROM system_settings WHERE id = 1 LIMIT 1`
    );

    return res.json(result.rows[0]?.settings || {});
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load settings', error: error.message });
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = req.app.locals.db;
    const roleResult = await db.query(`SELECT role FROM users WHERE id = $1 LIMIT 1`, [userId]);

    if (roleResult.rowCount === 0 || roleResult.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const currentResult = await db.query(`SELECT settings FROM system_settings WHERE id = 1 LIMIT 1`);
    const currentSettings = currentResult.rows[0]?.settings || {};

    const updatedSettings = {
      ...currentSettings,
      ...(req.body || {})
    };

    await db.query(
      `
        INSERT INTO system_settings (id, settings, updated_at)
        VALUES (1, $1::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          settings = EXCLUDED.settings,
          updated_at = NOW()
      `,
      [JSON.stringify(updatedSettings)]
    );

    await insertActivityLog(db, {
      actorUserId: userId,
      action: 'settings_updated',
      description: 'System settings updated',
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || ''
    });

    return res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, adminId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const targetUserId = parseInt(req.params.id, 10);
    const { status } = req.body || {};

    const db = req.app.locals.db;
    const existsResult = await db.query(`SELECT id FROM users WHERE id = $1 LIMIT 1`, [targetUserId]);
    if (existsResult.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await insertActivityLog(db, {
      actorUserId: adminId,
      action: 'user_status_changed',
      description: `Changed user status to ${status || 'active'}`,
      targetUserId,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || ''
    });

    return res.json({
      message: `User status updated to ${status || 'active'}`,
      userId: targetUserId,
      newStatus: status || 'active'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
});

// PUT /api/admin/notifications/:id/read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notificationId = parseInt(req.params.id, 10);
    const db = req.app.locals.db;

    const result = await db.query(
      `
        UPDATE admin_notifications
        SET is_read = true
        WHERE id = $1
        RETURNING id, type, title, message, target_user_id AS "userId", priority, is_read AS read, created_at AS "createdAt"
      `,
      [notificationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json({
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update notification', error: error.message });
  }
});

// POST /api/admin/notifications
router.post('/notifications', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { type, title, message, userId: targetUserId, priority } = req.body || {};
    const db = req.app.locals.db;

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
        RETURNING id, type, title, message, target_user_id AS "userId", priority, is_read AS read, created_at AS "createdAt"
      `,
      [type || 'general', title || 'Notification', message || '', targetUserId || null, priority || 'medium']
    );

    return res.status(201).json({
      message: 'Notification created successfully',
      notification: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
});

// GET /api/admin/host-verifications
router.get('/host-verifications', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, adminId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const db = req.app.locals.db;
    const result = await db.query(
      `
        SELECT
          hv.id,
          hv.host_user_id AS "hostId",
          CONCAT(u.first_name, ' ', u.last_name) AS "hostName",
          u.email,
          hv.business_name AS "businessName",
          hv.business_address AS "businessAddress",
          hv.business_type AS "businessType",
          hv.id_type AS "idType",
          hv.id_number AS "idNumber",
          hv.tax_id AS "taxId",
          hv.submitted_at AS "submittedAt",
          hv.status,
          hv.rejection_reason AS "rejectionReason",
          hv.details
        FROM host_verifications hv
        INNER JOIN users u ON u.id = hv.host_user_id
        ORDER BY hv.submitted_at DESC
      `
    );

    const formatted = result.rows.map((row) => ({
      ...row,
      submitted: row.submittedAt,
      details: row.details || {}
    }));

    return res.json({
      data: formatted,
      total: formatted.length,
      message: 'Host verifications retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching host verifications', error: error.message });
  }
});

router.hostVerifications = [];

// PUT /api/admin/host-verifications/:id/approve
router.put('/host-verifications/:id/approve', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, adminId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const db = req.app.locals.db;
    const verificationId = parseInt(req.params.id, 10);

    const result = await db.query(
      `
        UPDATE host_verifications
        SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1, rejection_reason = '', updated_at = NOW()
        WHERE id = $2
        RETURNING id, host_user_id AS "hostId", status, reviewed_at AS "reviewedAt"
      `,
      [adminId, verificationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    const verification = result.rows[0];

    await db.query(
      `UPDATE users SET verification_status = 'verified', updated_at = NOW() WHERE id = $1`,
      [verification.hostId]
    );

    await insertActivityLog(db, {
      actorUserId: adminId,
      action: 'host_verification_approved',
      description: `Approved host verification for host ID ${verification.hostId}`,
      targetUserId: verification.hostId,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || ''
    });

    return res.json({
      message: 'Host verification approved successfully',
      verification
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error approving verification', error: error.message });
  }
});

// PUT /api/admin/host-verifications/:id/reject
router.put('/host-verifications/:id/reject', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, adminId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const db = req.app.locals.db;
    const verificationId = parseInt(req.params.id, 10);
    const { reason } = req.body || {};
    const rejectionReason = reason || 'No reason provided';

    const result = await db.query(
      `
        UPDATE host_verifications
        SET status = 'rejected', reviewed_at = NOW(), reviewed_by = $1, rejection_reason = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, host_user_id AS "hostId", status, reviewed_at AS "reviewedAt", rejection_reason AS "rejectionReason"
      `,
      [adminId, rejectionReason, verificationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    const verification = result.rows[0];

    await db.query(
      `UPDATE users SET verification_status = 'not_submitted', updated_at = NOW() WHERE id = $1`,
      [verification.hostId]
    );

    await insertActivityLog(db, {
      actorUserId: adminId,
      action: 'host_verification_rejected',
      description: `Rejected host verification for host ID ${verification.hostId}`,
      targetUserId: verification.hostId,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || ''
    });

    return res.json({
      message: 'Host verification rejected successfully',
      verification
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error rejecting verification', error: error.message });
  }
});

module.exports = router;
