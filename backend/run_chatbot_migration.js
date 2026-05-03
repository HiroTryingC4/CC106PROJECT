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

async function runMigration() {
  try {
    console.log('Starting chatbot schema migration...\n');
    
    // Check if chatbot_messages table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chatbot_messages'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('✓ chatbot_messages table does not exist. No migration needed.');
      console.log('  The system is already using the unified schema.\n');
      process.exit(0);
    }
    
    console.log('Found chatbot_messages table. Starting migration...\n');
    
    // Read and execute migration script
    const sqlPath = path.join(__dirname, 'schema', 'chatbot_migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('\n✓ Migration completed successfully!\n');
    
    // Verify migration
    const verifyResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM chatbot_messages_backup) as old_count,
        (SELECT COUNT(*) FROM chat_messages) as new_count,
        (SELECT COUNT(*) FROM chat_sessions) as session_count
    `);
    
    const { old_count, new_count, session_count } = verifyResult.rows[0];
    
    console.log('Migration Summary:');
    console.log(`  Old messages (chatbot_messages_backup): ${old_count}`);
    console.log(`  New messages (chat_messages): ${new_count}`);
    console.log(`  Sessions created: ${session_count}`);
    
    if (parseInt(new_count) >= parseInt(old_count)) {
      console.log('\n✓ All messages migrated successfully!');
      console.log('\nThe old table has been renamed to chatbot_messages_backup.');
      console.log('After verifying everything works, you can drop it with:');
      console.log('  DROP TABLE chatbot_messages_backup;\n');
    } else {
      console.log('\n⚠ Warning: Some messages may not have been migrated.');
      console.log('  Please verify the data before proceeding.\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('\nThe migration has been rolled back.');
    console.error('Your original data is safe in the chatbot_messages table.\n');
    process.exit(1);
  }
}

runMigration();
