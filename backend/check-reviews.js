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

async function checkReviews() {
  try {
    console.log('Checking reviews data...\n');
    
    // Get all reviews with details
    const result = await pool.query(`
      SELECT 
        pr.id,
        pr.property_id,
        pr.guest_id,
        pr.host_id,
        pr.rating,
        pr.comment,
        pr.created_at,
        CONCAT(guest.first_name, ' ', guest.last_name) AS guest_name,
        CONCAT(host.first_name, ' ', host.last_name) AS host_name,
        p.title AS property_title
      FROM property_reviews pr
      LEFT JOIN users guest ON pr.guest_id = guest.id
      LEFT JOIN users host ON pr.host_id = host.id
      LEFT JOIN properties p ON pr.property_id = p.id
      ORDER BY pr.created_at DESC
    `);
    
    console.log(`Total reviews: ${result.rows.length}\n`);
    
    result.rows.forEach(row => {
      console.log(`Review ID: ${row.id}`);
      console.log(`  Property: ${row.property_title} (ID: ${row.property_id})`);
      console.log(`  Guest: ${row.guest_name} (ID: ${row.guest_id})`);
      console.log(`  Host: ${row.host_name} (ID: ${row.host_id})`);
      console.log(`  Rating: ${row.rating} stars`);
      console.log(`  Comment: ${row.comment.substring(0, 100)}...`);
      console.log(`  Date: ${row.created_at}`);
      console.log('');
    });
    
    // Check which properties have reviews
    console.log('\n--- Properties with review counts ---');
    const propResult = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.host_id,
        CONCAT(u.first_name, ' ', u.last_name) AS host_name,
        COUNT(pr.id) as review_count
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      LEFT JOIN property_reviews pr ON p.id = pr.property_id
      GROUP BY p.id, p.title, p.host_id, u.first_name, u.last_name
      HAVING COUNT(pr.id) > 0
      ORDER BY review_count DESC
    `);
    
    propResult.rows.forEach(row => {
      console.log(`Property ID ${row.id}: "${row.title}" by ${row.host_name} - ${row.review_count} reviews`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkReviews();
