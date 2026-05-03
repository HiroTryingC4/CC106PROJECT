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

async function clearActivityLogs() {
  try {
    console.log('\n=== Clearing all activity logs ===');

    // Count before
    const beforeCount = await pool.query('SELECT COUNT(*) FROM admin_activity_logs');
    console.log(`Total logs before: ${beforeCount.rows[0].count}`);

    // Delete all activity logs
    const result = await pool.query('DELETE FROM admin_activity_logs');
    console.log(`Deleted ${result.rowCount} activity logs`);

    // Count after
    const afterCount = await pool.query('SELECT COUNT(*) FROM admin_activity_logs');
    console.log(`Total logs after: ${afterCount.rows[0].count}`);

    console.log('\n✅ All activity logs cleared!');
    console.log('New activity logs will be created when admin actions are performed.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

clearActivityLogs();
