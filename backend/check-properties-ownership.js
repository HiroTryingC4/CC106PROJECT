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

async function checkPropertiesOwnership() {
  try {
    console.log('Checking properties ownership...\n');
    
    // Total properties
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM properties');
    console.log(`Total properties in database: ${totalResult.rows[0].total}\n`);
    
    // Properties by user role
    const byRoleResult = await pool.query(`
      SELECT 
        u.role,
        COUNT(p.id) as property_count
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      GROUP BY u.role
      ORDER BY property_count DESC
    `);
    
    console.log('--- Properties by user role ---');
    byRoleResult.rows.forEach(row => {
      console.log(`${row.role || 'NULL (no user)'}: ${row.property_count} properties`);
    });
    
    // Check for properties with non-existent users
    const orphanResult = await pool.query(`
      SELECT COUNT(*) as orphan_count
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      WHERE u.id IS NULL
    `);
    
    console.log(`\nOrphan properties (no matching user): ${orphanResult.rows[0].orphan_count}`);
    
    // Show host users and their property counts
    console.log('\n--- Host users and their properties ---');
    const hostsResult = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        COUNT(p.id) as property_count
      FROM users u
      LEFT JOIN properties p ON p.host_id = u.id
      WHERE u.role = 'host'
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY property_count DESC
    `);
    
    hostsResult.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.first_name} ${row.last_name} (${row.role}) - ${row.property_count} properties`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkPropertiesOwnership();
