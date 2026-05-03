const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smartstay',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

async function checkEmailVerificationSetup() {
  console.log('\n🔍 Checking Email Verification Setup...\n');
  
  try {
    // 1. Check if columns exist
    console.log('1️⃣ Checking if email verification columns exist...');
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name IN ('email_verified', 'verification_token', 'verification_token_expires')
      ORDER BY column_name;
    `);
    
    if (columnsCheck.rows.length === 3) {
      console.log('   ✅ All email verification columns exist:');
      columnsCheck.rows.forEach(col => {
        console.log(`      - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('   ❌ Missing columns! Found:', columnsCheck.rows.length, 'of 3');
      console.log('   Run the migration: node scripts/run_email_verification_migration.js');
      return;
    }
    
    // 2. Check index
    console.log('\n2️⃣ Checking verification token index...');
    const indexCheck = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users' 
      AND indexname = 'idx_users_verification_token';
    `);
    
    if (indexCheck.rows.length > 0) {
      console.log('   ✅ Index exists: idx_users_verification_token');
    } else {
      console.log('   ⚠️  Index missing (not critical, but recommended)');
    }
    
    // 3. Check user verification status
    console.log('\n3️⃣ Checking user verification status...');
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN email_verified = TRUE THEN 1 END) as verified_users,
        COUNT(CASE WHEN email_verified = FALSE THEN 1 END) as unverified_users,
        COUNT(CASE WHEN verification_token IS NOT NULL THEN 1 END) as users_with_token,
        COUNT(CASE WHEN verification_token_expires < NOW() THEN 1 END) as expired_tokens
      FROM users;
    `);
    
    const stats = userStats.rows[0];
    console.log('   📊 User Statistics:');
    console.log(`      Total users: ${stats.total_users}`);
    console.log(`      Verified: ${stats.verified_users}`);
    console.log(`      Unverified: ${stats.unverified_users}`);
    console.log(`      With active token: ${stats.users_with_token}`);
    console.log(`      Expired tokens: ${stats.expired_tokens}`);
    
    // 4. Show unverified users
    if (parseInt(stats.unverified_users) > 0) {
      console.log('\n4️⃣ Unverified users:');
      const unverified = await pool.query(`
        SELECT 
          id,
          email,
          first_name,
          created_at,
          verification_token IS NOT NULL as has_token,
          CASE 
            WHEN verification_token_expires > NOW() THEN 'Valid'
            WHEN verification_token_expires < NOW() THEN 'Expired'
            WHEN verification_token_expires IS NULL THEN 'No expiry'
          END as token_status
        FROM users
        WHERE email_verified = FALSE
        ORDER BY created_at DESC
        LIMIT 10;
      `);
      
      unverified.rows.forEach(user => {
        console.log(`      - ${user.email} (ID: ${user.id})`);
        console.log(`        Created: ${user.created_at}`);
        console.log(`        Has token: ${user.has_token ? '✅' : '❌'}`);
        console.log(`        Token status: ${user.token_status}`);
      });
      
      if (parseInt(stats.unverified_users) > 10) {
        console.log(`      ... and ${parseInt(stats.unverified_users) - 10} more`);
      }
    }
    
    // 5. Check environment variables
    console.log('\n5️⃣ Checking email configuration...');
    const emailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    if (emailConfigured) {
      console.log('   ✅ Email credentials configured');
      console.log(`      SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
      console.log(`      SMTP Port: ${process.env.SMTP_PORT || '587'}`);
      console.log(`      SMTP User: ${process.env.SMTP_USER}`);
      console.log(`      Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    } else {
      console.log('   ❌ Email credentials NOT configured');
      console.log('      Set SMTP_USER and SMTP_PASS in .env file');
    }
    
    console.log('\n✨ Diagnostic complete!\n');
    
    // Recommendations
    console.log('📝 Recommendations:');
    if (parseInt(stats.unverified_users) > 0 && !emailConfigured) {
      console.log('   - Configure email settings to send verification emails');
      console.log('   - Or manually verify users with: UPDATE users SET email_verified = TRUE;');
    }
    if (parseInt(stats.expired_tokens) > 0) {
      console.log('   - Some users have expired tokens. They need to request new ones.');
    }
    if (columnsCheck.rows.length < 3) {
      console.log('   - Run migration: node scripts/run_email_verification_migration.js');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. Database credentials in .env are correct');
    console.error('  3. Database exists and is accessible');
  } finally {
    await pool.end();
  }
}

// Run the check
checkEmailVerificationSetup();
