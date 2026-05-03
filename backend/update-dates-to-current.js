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

async function updateDatesToCurrentRange() {
  try {
    console.log('Updating booking and payment dates to current date range...\n');
    
    // Update bookings - spread them across last 30 days
    const bookingsResult = await pool.query(`
      UPDATE bookings
      SET created_at = NOW() - (random() * INTERVAL '30 days')
      WHERE created_at > NOW()
      RETURNING id, created_at
    `);
    
    console.log(`Updated ${bookingsResult.rowCount} bookings to current date range`);
    
    // Update payments - spread them across last 30 days
    const paymentsResult = await pool.query(`
      UPDATE payments
      SET 
        created_at = NOW() - (random() * INTERVAL '30 days'),
        completed_at = NOW() - (random() * INTERVAL '30 days')
      WHERE created_at > NOW() OR completed_at > NOW()
      RETURNING id, created_at, completed_at
    `);
    
    console.log(`Updated ${paymentsResult.rowCount} payments to current date range\n`);
    
    // Show bookings distribution
    console.log('--- Bookings by date (last 30 days) ---');
    const bookingsByDate = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    bookingsByDate.rows.forEach(row => {
      console.log(`${row.date.toISOString().split('T')[0]}: ${row.count} bookings`);
    });
    
    // Show payments distribution
    console.log('\n--- Payments by date (last 30 days) ---');
    const paymentsByDate = await pool.query(`
      SELECT 
        DATE(COALESCE(completed_at, created_at)) as date,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM payments
      WHERE COALESCE(completed_at, created_at) >= NOW() - INTERVAL '30 days'
        AND status = 'completed'
      GROUP BY DATE(COALESCE(completed_at, created_at))
      ORDER BY date DESC
    `);
    
    paymentsByDate.rows.forEach(row => {
      console.log(`${row.date.toISOString().split('T')[0]}: ${row.count} payments, Total: ₱${parseFloat(row.total_amount).toFixed(2)}`);
    });
    
    console.log('\n✅ Update completed successfully!');
    console.log('Refresh your admin dashboard to see the charts populated with data.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error during update:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateDatesToCurrentRange();
