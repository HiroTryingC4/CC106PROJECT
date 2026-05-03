const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  Object.assign(process.env, envConfig);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smartstay',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function setupSettingsTables() {
  try {
    console.log('Setting up communication settings tables...');
    
    // Read and execute communication_settings.sql
    const sqlPath = path.join(__dirname, 'schema', 'communication_settings.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    console.log('✓ Communication settings tables created successfully');
    
    // Check if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('communication_settings', 'system_status')
      ORDER BY table_name
    `);
    
    console.log('\nCreated tables:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Verify data
    const settingsResult = await pool.query('SELECT * FROM communication_settings WHERE id = 1');
    console.log('\nDefault settings:');
    console.log(settingsResult.rows[0]);
    
    const statusResult = await pool.query('SELECT service_name, status FROM system_status ORDER BY service_name');
    console.log('\nSystem status:');
    statusResult.rows.forEach(row => console.log(`  - ${row.service_name}: ${row.status}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up tables:', error);
    process.exit(1);
  }
}

setupSettingsTables();
