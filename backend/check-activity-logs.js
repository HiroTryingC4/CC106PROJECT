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

async function checkActivityLogs() {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        actor_user_id,
        action,
        description,
        created_at
      FROM admin_activity_logs
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log('\n=== Activity Logs ===');
    console.log(`Total logs: ${result.rowCount}`);
    
    if (result.rowCount > 0) {
      console.log('\nRecent logs:');
      result.rows.forEach(log => {
        console.log(`\nID: ${log.id}`);
        console.log(`Action: ${log.action}`);
        console.log(`Description: ${log.description}`);
        console.log(`User: ${log.actor_user_id}`);
        console.log(`Date: ${log.created_at}`);
      });

      // Count by action type
      const countResult = await pool.query(`
        SELECT action, COUNT(*) as count
        FROM admin_activity_logs
        GROUP BY action
        ORDER BY count DESC
      `);

      console.log('\n=== Action Counts ===');
      countResult.rows.forEach(row => {
        console.log(`${row.action}: ${row.count}`);
      });
    } else {
      console.log('\nNo activity logs found in database.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkActivityLogs();
