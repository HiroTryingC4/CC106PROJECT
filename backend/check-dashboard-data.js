const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Pool } = require('pg');

const envPath = path.resolve(__dirname, '.env');
const envConfig = fs.existsSync(envPath)
  ? dotenv.parse(fs.readFileSync(envPath))
  : {};

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

async function checkDashboardData() {
  try {
    console.log('Checking dashboard data...\n');
    
    // Simulate the exact query from admin.js
    const bookingsResult = await pool.query(`
      SELECT
        DATE(b.created_at) as date,
        COUNT(*)::int as value
      FROM bookings b
      WHERE b.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(b.created_at)
      ORDER BY date ASC
    `);
    
    console.log('--- Raw bookings query result ---');
    console.log(`Total rows: ${bookingsResult.rows.length}\n`);
    
    bookingsResult.rows.forEach(row => {
      console.log(`Date: ${row.date}, Value: ${row.value}`);
    });
    
    // Format like the API does
    const bookingsData = bookingsResult.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: row.value || 0
    }));
    
    console.log('\n--- Formatted bookingsData (as sent to frontend) ---');
    console.log(JSON.stringify(bookingsData, null, 2));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkDashboardData();
