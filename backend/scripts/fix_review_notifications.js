const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smartstay',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

async function fixReviewNotifications() {
  try {
    console.log('Fixing review_reply notifications with null subject_id...');
    
    const result = await pool.query(`
      UPDATE user_notifications 
      SET subject_id = (
        SELECT booking_id 
        FROM property_reviews pr 
        WHERE pr.guest_id = user_notifications.user_id 
        AND pr.host_reply IS NOT NULL 
        ORDER BY pr.created_at DESC
        LIMIT 1
      )
      WHERE type = 'review_reply' AND subject_id IS NULL
      RETURNING id, user_id, subject_id;
    `);
    
    console.log(`✓ Fixed ${result.rowCount} notification(s)`);
    
    if (result.rowCount > 0) {
      console.log('\nUpdated notifications:');
      result.rows.forEach(row => {
        console.log(`  - Notification ID: ${row.id}, User ID: ${row.user_id}, Booking ID: ${row.subject_id}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing notifications:', error);
    process.exit(1);
  }
}

fixReviewNotifications();
