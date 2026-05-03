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

async function cleanupActivityLogs() {
  try {
    console.log('\n=== Cleaning up duplicate activity logs ===');

    // Count before
    const beforeCount = await pool.query('SELECT COUNT(*) FROM admin_activity_logs');
    console.log(`Total logs before cleanup: ${beforeCount.rows[0].count}`);

    // Delete duplicates, keeping only the one with the lowest ID for each unique combination
    const result = await pool.query(`
      DELETE FROM admin_activity_logs
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM admin_activity_logs
        GROUP BY action, description, COALESCE(actor_user_id, 0), created_at
      )
    `);

    console.log(`Deleted ${result.rowCount} duplicate logs`);

    // Count after
    const afterCount = await pool.query('SELECT COUNT(*) FROM admin_activity_logs');
    console.log(`Total logs after cleanup: ${afterCount.rows[0].count}`);

    // Show remaining logs
    const remaining = await pool.query(`
      SELECT action, COUNT(*) as count
      FROM admin_activity_logs
      GROUP BY action
      ORDER BY count DESC
    `);

    console.log('\n=== Remaining logs by action ===');
    remaining.rows.forEach(row => {
      console.log(`${row.action}: ${row.count}`);
    });

    console.log('\n✅ Cleanup completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

cleanupActivityLogs();
