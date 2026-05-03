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

async function cleanupDuplicates() {
  try {
    console.log('Starting cleanup of duplicate properties...\n');
    
    // Get count before cleanup
    const beforeCount = await pool.query('SELECT COUNT(*) as total FROM properties');
    console.log(`Total properties before cleanup: ${beforeCount.rows[0].total}`);
    
    // Delete duplicates, keeping only the first occurrence of each unique property
    // We identify duplicates by title, host_id, and price_per_night
    const deleteResult = await pool.query(`
      DELETE FROM properties
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM properties
        GROUP BY title, host_id, price_per_night, type, bedrooms, bathrooms
      )
    `);
    
    console.log(`Deleted ${deleteResult.rowCount} duplicate records\n`);
    
    // Get count after cleanup
    const afterCount = await pool.query('SELECT COUNT(*) as total FROM properties');
    console.log(`Total properties after cleanup: ${afterCount.rows[0].total}`);
    
    // Show remaining properties
    console.log('\n--- Remaining properties ---');
    const result = await pool.query('SELECT id, title, host_id, price_per_night FROM properties ORDER BY id');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Host ID: ${row.host_id}, Price: ₱${row.price_per_night}`);
    });
    
    console.log('\n✅ Cleanup completed successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    await pool.end();
    process.exit(1);
  }
}

cleanupDuplicates();
