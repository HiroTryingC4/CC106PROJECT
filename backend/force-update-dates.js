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

async function forceUpdateDates() {
  try {
    console.log('Force updating ALL booking and payment dates to last 30 days...\n');
    
    // Get current timestamp from database
    const nowResult = await pool.query('SELECT NOW() as current_time');
    console.log(`Database current time: ${nowResult.rows[0].current_time}\n`);
    
    // Update ALL bookings - spread them randomly across last 30 days
    const bookingsResult = await pool.query(`
      WITH numbered_bookings AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn, COUNT(*) OVER() as total
        FROM bookings
      )
      UPDATE bookings b
      SET created_at = NOW() - ((nb.rn::float / nb.total) * INTERVAL '30 days')
      FROM numbered_bookings nb
      WHERE b.id = nb.id
      RETURNING b.id, b.created_at
    `);
    
    console.log(`Updated ${bookingsResult.rowCount} bookings\n`);
    
    // Update ALL payments - spread them randomly across last 30 days
    const paymentsResult = await pool.query(`
      WITH numbered_payments AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn, COUNT(*) OVER() as total
        FROM payments
      )
      UPDATE payments p
      SET 
        created_at = NOW() - ((np.rn::float / np.total) * INTERVAL '30 days'),
        completed_at = NOW() - ((np.rn::float / np.total) * INTERVAL '30 days')
      FROM numbered_payments np
      WHERE p.id = np.id
      RETURNING p.id, p.created_at, p.completed_at
    `);
    
    console.log(`Updated ${paymentsResult.rowCount} payments\n`);
    
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
      LIMIT 10
    `);
    
    bookingsByDate.rows.forEach(row => {
      console.log(`${row.date.toISOString().split('T')[0]}: ${row.count} bookings`);
    });
    
    // Show payments distribution
    console.log('\n--- Completed payments by date (last 30 days) ---');
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
      LIMIT 10
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

forceUpdateDates();
