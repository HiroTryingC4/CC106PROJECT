/**
 * Shared activity logger — writes to admin_activity_logs table.
 * Fire-and-forget: errors are caught and logged but never thrown.
 */
const logActivity = async (db, { actorUserId, action, description, ipAddress = '', userAgent = '', targetUserId = null, targetPropertyId = null }) => {
  try {
    await db.query(
      `INSERT INTO admin_activity_logs
        (actor_user_id, action, description, ip_address, user_agent, target_user_id, target_property_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [actorUserId, action, description, ipAddress, userAgent, targetUserId, targetPropertyId]
    );
  } catch (err) {
    console.error('Activity log error (non-fatal):', err.message);
  }
};

module.exports = { logActivity };
