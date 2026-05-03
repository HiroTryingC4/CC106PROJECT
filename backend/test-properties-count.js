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

async function testCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM properties');
    console.log('Total properties count:', result.rows[0].total);
    
    const sumResult = await pool.query('SELECT SUM(id) as sum_ids FROM properties');
    console.log('Sum of all property IDs:', sumResult.rows[0].sum_ids);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

testCount();
