const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smartstay',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running host reply migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/add_host_reply_to_reviews.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Host reply migration completed successfully!');
    console.log('Added columns: host_reply, host_reply_date');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
