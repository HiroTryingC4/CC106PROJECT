const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
const envConfig = fs.existsSync(envPath)
  ? dotenv.parse(fs.readFileSync(envPath))
  : {};

Object.assign(process.env, envConfig);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smartstay',
  port: parseInt(process.env.DB_PORT || '5432', 10)
});

async function cleanupUsers() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // First, let's see what users we have
    console.log('\n=== Current Users ===');
    const allUsers = await client.query(`
      SELECT id, email, role, first_name, last_name 
      FROM users 
      ORDER BY id
    `);
    allUsers.rows.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Name: ${u.first_name} ${u.last_name}`);
    });

    // Keep these user IDs: 6, 8, and the two admin accounts
    const keepEmails = ['ryuramos@gmail.com', 'ryevincent99@gmail.com', 'admin@smartstay.com', 'comadmin@smartstay.com'];
    const keepIds = [6, 8];

    // Get the IDs to keep
    const keepUsers = await client.query(`
      SELECT id FROM users 
      WHERE id = ANY($1) OR LOWER(email) = ANY($2)
    `, [keepIds, keepEmails.map(e => e.toLowerCase())]);

    const keepUserIds = keepUsers.rows.map(u => u.id);
    console.log('\n=== Users to Keep (IDs) ===');
    console.log(keepUserIds);

    // Delete related data for users we're removing
    console.log('\n=== Deleting related data for other users ===');

    // Delete property reviews
    const deleteReviews = await client.query(`
      DELETE FROM property_reviews 
      WHERE guest_id NOT IN (SELECT unnest($1::int[]))
         OR host_id NOT IN (SELECT unnest($1::int[]))
      RETURNING id
    `, [keepUserIds]);
    console.log(`Deleted ${deleteReviews.rowCount} reviews`);

    // Delete payments
    const deletePayments = await client.query(`
      DELETE FROM payments 
      WHERE payer_user_id NOT IN (SELECT unnest($1::int[]))
         OR host_id NOT IN (SELECT unnest($1::int[]))
      RETURNING id
    `, [keepUserIds]);
    console.log(`Deleted ${deletePayments.rowCount} payments`);

    // Delete bookings
    const deleteBookings = await client.query(`
      DELETE FROM bookings 
      WHERE guest_id NOT IN (SELECT unnest($1::int[]))
         OR host_id NOT IN (SELECT unnest($1::int[]))
      RETURNING id
    `, [keepUserIds]);
    console.log(`Deleted ${deleteBookings.rowCount} bookings`);

    // Delete properties
    const deleteProperties = await client.query(`
      DELETE FROM properties 
      WHERE host_id NOT IN (SELECT unnest($1::int[]))
      RETURNING id
    `, [keepUserIds]);
    console.log(`Deleted ${deleteProperties.rowCount} properties`);

    // Delete host verifications
    const deleteVerifications = await client.query(`
      DELETE FROM host_verifications 
      WHERE host_user_id NOT IN (SELECT unnest($1::int[]))
      RETURNING id
    `, [keepUserIds]);
    console.log(`Deleted ${deleteVerifications.rowCount} host verifications`);

    // Delete user_notifications (if table exists)
    try {
      const deleteNotifications = await client.query(`
        DELETE FROM user_notifications 
        WHERE user_id NOT IN (SELECT unnest($1::int[]))
        RETURNING id
      `, [keepUserIds]);
      console.log(`Deleted ${deleteNotifications.rowCount} notifications`);
    } catch (err) {
      if (err.code !== '42P01') throw err; // Ignore if table doesn't exist
      console.log('Notifications table does not exist, skipping...');
    }

    // Delete messages
    const deleteMessages = await client.query(`
      DELETE FROM messages 
      WHERE sender_id NOT IN (SELECT unnest($1::int[]))
         OR receiver_id NOT IN (SELECT unnest($1::int[]))
      RETURNING id
    `, [keepUserIds]);
    console.log(`Deleted ${deleteMessages.rowCount} messages`);

    // Delete users
    const deleteUsers = await client.query(`
      DELETE FROM users 
      WHERE id NOT IN (SELECT unnest($1::int[]))
      RETURNING id, email
    `, [keepUserIds]);
    console.log(`\n=== Deleted ${deleteUsers.rowCount} users ===`);
    deleteUsers.rows.forEach(u => {
      console.log(`Deleted user ID: ${u.id}, Email: ${u.email}`);
    });

    await client.query('COMMIT');

    // Show remaining users
    console.log('\n=== Remaining Users ===');
    const remainingUsers = await client.query(`
      SELECT id, email, role, first_name, last_name 
      FROM users 
      ORDER BY id
    `);
    remainingUsers.rows.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Name: ${u.first_name} ${u.last_name}`);
    });

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupUsers().catch(console.error);
