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

async function cleanupDuplicateReviews() {
  try {
    console.log('Cleaning up duplicate reviews...\n');
    
    // Get count before
    const beforeCount = await pool.query('SELECT COUNT(*) as total FROM property_reviews');
    console.log(`Total reviews before cleanup: ${beforeCount.rows[0].total}`);
    
    // Delete duplicates, keeping only the first occurrence
    const deleteResult = await pool.query(`
      DELETE FROM property_reviews
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM property_reviews
        GROUP BY property_id, guest_id, host_id, rating, comment, created_at
      )
    `);
    
    console.log(`Deleted ${deleteResult.rowCount} duplicate reviews\n`);
    
    // Get count after
    const afterCount = await pool.query('SELECT COUNT(*) as total FROM property_reviews');
    console.log(`Total reviews after cleanup: ${afterCount.rows[0].total}\n`);
    
    // Show remaining reviews
    console.log('--- Remaining reviews ---');
    const result = await pool.query(`
      SELECT 
        pr.id,
        p.title AS property_title,
        CONCAT(guest.first_name, ' ', guest.last_name) AS guest_name,
        pr.rating,
        LEFT(pr.comment, 50) as comment_preview
      FROM property_reviews pr
      LEFT JOIN properties p ON pr.property_id = p.id
      LEFT JOIN users guest ON pr.guest_id = guest.id
      ORDER BY pr.id
    `);
    
    result.rows.forEach(row => {
      console.log(`Review ID ${row.id}: ${row.guest_name} reviewed "${row.property_title}" - ${row.rating} stars`);
      console.log(`  Comment: ${row.comment_preview}...`);
    });
    
    console.log('\n✅ Cleanup completed successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

cleanupDuplicateReviews();
