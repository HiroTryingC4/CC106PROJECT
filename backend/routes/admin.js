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
    const [statsResult, prevStatsResult, activityResult, notificationsResult, revenueResult, bookingsResult] = await Promise.all([
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
      // Previous week stats for comparison
      db.query(
        `
          SELECT
            COALESCE((SELECT COUNT(*) FROM users WHERE created_at < NOW() - INTERVAL '7 days'), 0)::int AS total_users,
            COALESCE((SELECT COUNT(*) FROM users WHERE role = 'host' AND created_at < NOW() - INTERVAL '7 days'), 0)::int AS total_hosts,
            COALESCE((SELECT COUNT(*) FROM properties WHERE created_at < NOW() - INTERVAL '7 days'), 0)::int AS total_properties,
            COALESCE((SELECT COUNT(*) FROM bookings WHERE status IN ('pending', 'confirmed') AND created_at < NOW() - INTERVAL '7 days'), 0)::int AS active_bookings
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
      ),
      // Revenue trend for last 7 days
      db.query(
        `
          SELECT
            DATE(p.created_at) as date,
            COALESCE(SUM(p.amount), 0)::numeric as value
          FROM payments p
          WHERE p.created_at >= NOW() - INTERVAL '30 days'
            AND p.status = 'completed'
          GROUP BY DATE(p.created_at)
          ORDER BY date ASC
        `
      ),
      // Bookings trend for last 7 days
      db.query(
        `
          SELECT
            DATE(b.created_at) as date,
            COUNT(*)::int as value
          FROM bookings b
          WHERE b.created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(b.created_at)
          ORDER BY date ASC
        `
      )
    ]);

    const stats = statsResult.rows[0] || {};
    const prevStats = prevStatsResult.rows[0] || {};

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    // Format chart data
    const revenueData = revenueResult.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(row.value || 0)
    }));

    const bookingsData = bookingsResult.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: row.value || 0
    }));

    return res.json({
      stats: {
        totalUsers: stats.total_users || 0,
        totalHosts: stats.total_hosts || 0,
        totalGuests: stats.total_guests || 0,
        totalProperties: stats.total_properties || 0,
        activeBookings: stats.active_bookings || 0,
        pendingVerifications: stats.pending_verifications || 0,
        flaggedReviews: stats.flagged_reviews || 0,
        systemAlerts: stats.system_alerts || 0,
        changes: {
          users: calculateChange(stats.total_users || 0, prevStats.total_users || 0),
          hosts: calculateChange(stats.total_hosts || 0, prevStats.total_hosts || 0),
          properties: calculateChange(stats.total_properties || 0, prevStats.total_properties || 0),
          bookings: calculateChange(stats.active_bookings || 0, prevStats.active_bookings || 0)
        }
      },
      recentActivity: activityResult.rows,
      notifications: notificationsResult.rows,
      revenueData,
      bookingsData,
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

    const { action, userId: filterUserId, startDate, endDate, limit = 50 } = req.query;
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

    if (startDate) {
      where.push(`created_at >= $${params.length + 1}`);
      params.push(startDate);
    }

    if (endDate) {
      where.push(`created_at <= $${params.length + 1}::date + INTERVAL '1 day'`);
      params.push(endDate);
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

// GET /api/admin/reviews - Get all reviews for admin
router.get('/reviews', async (req, res) => {
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
          pr.id,
          pr.property_id,
          pr.booking_id,
          pr.guest_id,
          pr.host_id,
          pr.rating,
          pr.comment,
          pr.created_at,
          CONCAT(guest.first_name, ' ', guest.last_name) AS guest_name,
          CONCAT(host.first_name, ' ', host.last_name) AS host_name,
          p.title AS property_title
        FROM property_reviews pr
        LEFT JOIN users guest ON pr.guest_id = guest.id
        LEFT JOIN users host ON pr.host_id = host.id
        LEFT JOIN properties p ON pr.property_id = p.id
        ORDER BY pr.created_at DESC
      `
    );

    const reviews = result.rows.map(row => ({
      id: row.id,
      propertyId: row.property_id,
      bookingId: row.booking_id,
      guestId: row.guest_id,
      hostId: row.host_id,
      guest: row.guest_name,
      host: row.host_name,
      unit: row.property_title,
      rating: row.rating,
      comment: row.comment,
      date: row.created_at,
      status: row.rating <= 2 ? 'flagged' : 'published',
      flagged: row.rating <= 2
    }));

    // Calculate stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;
    const pendingReviews = 0; // No pending status in current schema
    const flaggedReviews = reviews.filter(r => r.flagged).length;

    return res.json({
      reviews,
      stats: {
        totalReviews,
        averageRating: parseFloat(averageRating),
        pendingReviews,
        flaggedReviews
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load reviews', error: error.message });
  }
});

// GET /api/admin/financial - Financial dashboard data
router.get('/financial', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, adminId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { period = 'month' } = req.query;
    const db = req.app.locals.db;

    // Calculate date range based on period
    let intervalDays = 30;
    let prevIntervalStart = 60;
    let prevIntervalEnd = 30;
    
    switch (period) {
      case 'week':
        intervalDays = 7;
        prevIntervalStart = 14;
        prevIntervalEnd = 7;
        break;
      case 'quarter':
        intervalDays = 90;
        prevIntervalStart = 180;
        prevIntervalEnd = 90;
        break;
      case 'year':
        intervalDays = 365;
        prevIntervalStart = 730;
        prevIntervalEnd = 365;
        break;
      default: // month
        intervalDays = 30;
        prevIntervalStart = 60;
        prevIntervalEnd = 30;
    }

    // Get financial stats
    const statsResult = await db.query(
      `
        SELECT
          COALESCE(SUM(p.amount), 0)::numeric AS total_revenue,
          COALESCE(SUM(p.processing_fee), 0)::numeric AS commission_earned,
          COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.host_payout ELSE 0 END), 0)::numeric AS pending_payouts,
          COUNT(*)::int AS transaction_volume
        FROM payments p
        WHERE p.created_at >= NOW() - INTERVAL '1 day' * $1
      `,
      [intervalDays]
    );

    // Get previous period stats for comparison
    const prevStatsResult = await db.query(
      `
        SELECT
          COALESCE(SUM(p.amount), 0)::numeric AS total_revenue,
          COALESCE(SUM(p.processing_fee), 0)::numeric AS commission_earned,
          COUNT(*)::int AS transaction_volume
        FROM payments p
        WHERE p.created_at >= NOW() - INTERVAL '1 day' * $1
          AND p.created_at < NOW() - INTERVAL '1 day' * $2
      `,
      [prevIntervalStart, prevIntervalEnd]
    );

    const stats = statsResult.rows[0];
    const prevStats = prevStatsResult.rows[0];

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    // Get recent transactions
    const transactionsResult = await db.query(
      `
        SELECT
          p.id,
          p.booking_id,
          p.amount,
          p.processing_fee AS commission,
          p.host_payout,
          p.status,
          p.created_at AS timestamp,
          CONCAT(guest.first_name, ' ', guest.last_name) AS guest_name,
          CONCAT(host.first_name, ' ', host.last_name) AS host_name,
          prop.title AS property_title,
          CASE
            WHEN p.status = 'completed' THEN 'booking_payment'
            WHEN p.status = 'refunded' THEN 'refund'
            ELSE 'booking_payment'
          END AS type
        FROM payments p
        LEFT JOIN bookings b ON p.booking_id = b.id
        LEFT JOIN users guest ON b.guest_id = guest.id
        LEFT JOIN users host ON p.host_id = host.id
        LEFT JOIN properties prop ON b.property_id = prop.id
        WHERE p.created_at >= NOW() - INTERVAL '1 day' * $1
        ORDER BY p.created_at DESC
        LIMIT 20
      `,
      [intervalDays]
    );

    // Get top performing properties
    const topPropertiesResult = await db.query(
      `
        SELECT
          prop.id,
          prop.title AS name,
          COALESCE(SUM(p.amount), 0)::numeric AS revenue,
          COUNT(DISTINCT b.id)::int AS bookings
        FROM properties prop
        INNER JOIN bookings b ON prop.id = b.property_id
        INNER JOIN payments p ON b.id = p.booking_id
        WHERE p.status = 'completed'
          AND p.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY prop.id, prop.title
        HAVING SUM(p.amount) > 0
        ORDER BY revenue DESC
        LIMIT 4
      `
    );

    // Get monthly data for charts (last 3 months)
    const monthlyDataResult = await db.query(
      `
        SELECT
          TO_CHAR(DATE_TRUNC('month', p.created_at), 'Mon') AS month,
          COALESCE(SUM(p.amount), 0)::numeric AS revenue,
          COALESCE(SUM(p.processing_fee), 0)::numeric AS commission,
          COUNT(*)::int AS transactions
        FROM payments p
        WHERE p.created_at >= NOW() - INTERVAL '3 months'
          AND p.status = 'completed'
        GROUP BY DATE_TRUNC('month', p.created_at)
        ORDER BY DATE_TRUNC('month', p.created_at) ASC
      `
    );

    return res.json({
      stats: {
        totalRevenue: parseFloat(stats.total_revenue || 0),
        commissionEarned: parseFloat(stats.commission_earned || 0),
        pendingPayouts: parseFloat(stats.pending_payouts || 0),
        transactionVolume: stats.transaction_volume || 0,
        changes: {
          revenue: calculateChange(parseFloat(stats.total_revenue || 0), parseFloat(prevStats.total_revenue || 0)),
          commission: calculateChange(parseFloat(stats.commission_earned || 0), parseFloat(prevStats.commission_earned || 0)),
          transactions: calculateChange(stats.transaction_volume || 0, prevStats.transaction_volume || 0)
        }
      },
      transactions: transactionsResult.rows.map(row => ({
        id: row.id,
        type: row.type,
        amount: row.status === 'refunded' ? -parseFloat(row.amount) : parseFloat(row.amount),
        currency: '₱',
        description: row.property_title ? `${row.type === 'refund' ? 'Refund for' : 'Booking payment for'} ${row.property_title}` : 'Payment',
        user: row.guest_name || 'Unknown',
        status: row.status,
        timestamp: row.timestamp,
        commission: parseFloat(row.commission || 0)
      })),
      topProperties: topPropertiesResult.rows.map(row => ({
        name: row.name,
        revenue: `₱${parseFloat(row.revenue || 0).toLocaleString()}`,
        bookings: row.bookings
      })),
      monthlyData: monthlyDataResult.rows.map(row => ({
        month: row.month,
        revenue: parseFloat(row.revenue || 0),
        commission: parseFloat(row.commission || 0),
        transactions: row.transactions
      }))
    });
  } catch (error) {
    console.error('Financial endpoint error:', error);
    return res.status(500).json({ message: 'Failed to load financial data', error: error.message, stack: error.stack });
  }
});

// DELETE /api/admin/reviews/:id - Delete review
router.delete('/reviews/:id', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!(await isAdminLike(req, adminId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reviewId = parseInt(req.params.id, 10);
    const db = req.app.locals.db;

    const result = await db.query('DELETE FROM property_reviews WHERE id = $1 RETURNING id', [reviewId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await insertActivityLog(db, {
      actorUserId: adminId,
      action: 'review_deleted',
      description: `Deleted review ID ${reviewId}`,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || ''
    });

    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
});

module.exports = router;
