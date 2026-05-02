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

async function checkDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW() AS current_time, current_database() AS database_name');
    console.log('Database connection successful');
    console.log(`Database: ${result.rows[0].database_name}`);
    console.log(`Server time: ${result.rows[0].current_time}`);
  } catch (error) {
    console.error('Database connection failed');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkDatabaseConnection();
