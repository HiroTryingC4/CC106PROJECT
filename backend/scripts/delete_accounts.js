const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smartstay',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

async function deleteAccounts() {
  const emailsToDelete = [
    'ryevincent98@gmail.com',
    'ramos.ryevincent.clemente@gmail.com',
    'ryevincent100@gmail.com',
    'levelthugtwentyeight@gmail.com'
  ];

  try {
    console.log('\n🗑️  Deleting user accounts...\n');

    for (const email of emailsToDelete) {
      // Check if user exists
      const checkResult = await pool.query(
        'SELECT id, email, first_name, last_name, role FROM users WHERE email = $1',
        [email]
      );

      if (checkResult.rows.length === 0) {
        console.log(`⚠️  ${email} - Not found (already deleted or never existed)`);
        continue;
      }

      const user = checkResult.rows[0];
      console.log(`🔍 Found: ${email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);

      // Delete the user (CASCADE will handle related records)
      const deleteResult = await pool.query(
        'DELETE FROM users WHERE id = $1',
        [user.id]
      );

      if (deleteResult.rowCount > 0) {
        console.log(`   ✅ Deleted successfully\n`);
      } else {
        console.log(`   ❌ Failed to delete\n`);
      }
    }

    console.log('✨ Deletion complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

deleteAccounts();
