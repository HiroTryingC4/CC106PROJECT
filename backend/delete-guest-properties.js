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

async function deleteGuestProperties() {
  try {
    console.log('Deleting properties owned by guest users...\n');
    
    // Show properties that will be deleted
    const toDeleteResult = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.host_id,
        u.first_name,
        u.last_name,
        u.role
      FROM properties p
      INNER JOIN users u ON p.host_id = u.id
      WHERE u.role = 'guest'
      ORDER BY p.id
    `);
    
    console.log(`Found ${toDeleteResult.rows.length} properties owned by guests:\n`);
    toDeleteResult.rows.forEach(row => {
      console.log(`Property ID ${row.id}: "${row.title}" owned by ${row.first_name} ${row.last_name} (User ID: ${row.host_id})`);
    });
    
    // Delete the properties
    const deleteResult = await pool.query(`
      DELETE FROM properties
      WHERE host_id IN (
        SELECT id FROM users WHERE role = 'guest'
      )
    `);
    
    console.log(`\n✅ Deleted ${deleteResult.rowCount} properties owned by guest users\n`);
    
    // Show final count
    const finalResult = await pool.query(`
      SELECT 
        COUNT(*) as total_properties,
        (SELECT COUNT(*) FROM properties p INNER JOIN users u ON p.host_id = u.id WHERE u.role = 'host') as host_properties,
        (SELECT COUNT(*) FROM properties p INNER JOIN users u ON p.host_id = u.id WHERE u.role = 'guest') as guest_properties
      FROM properties
    `);
    
    console.log('--- Final property counts ---');
    console.log(`Total properties: ${finalResult.rows[0].total_properties}`);
    console.log(`Properties owned by hosts: ${finalResult.rows[0].host_properties}`);
    console.log(`Properties owned by guests: ${finalResult.rows[0].guest_properties}`);
    
    console.log('\n✅ Cleanup completed successfully!');
    console.log('Refresh your admin dashboard and users page to see updated counts.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    await pool.end();
    process.exit(1);
  }
}

deleteGuestProperties();
