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

async function showProperties() {
  try {
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM properties');
    console.log('Total properties:', countResult.rows[0].total);
    console.log('\n--- First 10 properties ---');
    
    // Get first 10 records
    const result = await pool.query('SELECT id, title, host_id FROM properties ORDER BY id LIMIT 10');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Host ID: ${row.host_id}`);
    });
    
    console.log('\n--- Last 10 properties ---');
    
    // Get last 10 records
    const lastResult = await pool.query('SELECT id, title, host_id FROM properties ORDER BY id DESC LIMIT 10');
    lastResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Host ID: ${row.host_id}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

showProperties();
