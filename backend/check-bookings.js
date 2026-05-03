const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Pool } = require('pg');

const envPath = path.resolve(__dirname, '.env');
const envConfig = fs.existsSync(envPath)
  ? dotenv.parse(fs.readFileSync(envPath))
  : {};;

const resolvedEnv = {
  ...process.env,
  ...envConfig
};

const pool = new Pool({
  host: resolvedEnv.DB_HOST || 'localhost',
  user: resolvedEnv.DB_USER || 'postgres',
  password: resolvedEnv.DB_PASSWORD || 'postgres',
  database: resolvedEnv.DB_NAME || 'smartstay',
  port: parseInt(resolvedEnv.DB_PORT || '5432', 10)
});

async function checkBookings() {
  try {
    // Get total bookings count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM bookings');
    console.log(`Total bookings: ${countResult.rows[0].total}\n`);
    
    if (countResult.rows[0].total > 0) {
      // Get bookings from last 30 days
      const recentResult = await pool.query(`
        SELECT COUNT(*) as recent_count 
        FROM bookings 
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);
      console.log(`Bookings in last 30 days: ${recentResult.rows[0].recent_count}\n`);
      
      // Show first 10 bookings
      console.log('--- First 10 bookings ---');
      const result = await pool.query(`
        SELECT id, guest_id, property_id, status, created_at 
        FROM bookings 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      result.rows.forEach(row => {
        console.log(`ID: ${row.id}, Guest: ${row.guest_id}, Property: ${row.property_id}, Status: ${row.status}, Created: ${row.created_at}`);
      });
    } else {
      console.log('No bookings found in the database.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkBookings();
