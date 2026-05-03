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

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smartstay',
  port: parseInt(process.env.DB_PORT || '5432', 10)
});

async function createFavoritesTable() {
  try {
    console.log('Connecting to database...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create_favorites_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Creating favorites table...');
    await pool.query(sql);
    
    console.log('✓ Favorites table created successfully!');
    
    // Verify table exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nTable structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error creating favorites table:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createFavoritesTable();
