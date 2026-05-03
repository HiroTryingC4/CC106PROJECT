const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smartstay',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

async function checkTokens() {
  try {
    console.log('\n🔍 Checking verification tokens...\n');
    
    // Get users with tokens
    const result = await pool.query(`
      SELECT 
        id,
        email,
        verification_token,
        verification_token_expires,
        email_verified,
        LENGTH(verification_token) as token_length,
        verification_token_expires > NOW() as is_valid
      FROM users 
      WHERE verification_token IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No users with verification tokens found!');
      console.log('\nThis means:');
      console.log('  - Tokens are not being saved to database during registration');
      console.log('  - Check backend logs during registration for errors');
      return;
    }
    
    console.log(`Found ${result.rows.length} user(s) with verification tokens:\n`);
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
      console.log(`   Token: ${user.verification_token.substring(0, 20)}...`);
      console.log(`   Token Length: ${user.token_length} characters`);
      console.log(`   Expires: ${user.verification_token_expires}`);
      console.log(`   Valid: ${user.is_valid ? '✅ Yes' : '❌ Expired'}`);
      console.log(`   Verified: ${user.email_verified ? '✅ Yes' : '❌ No'}`);
      console.log('');
    });
    
    // Show what the verification URL should look like
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (result.rows.length > 0) {
      const sampleToken = result.rows[0].verification_token;
      console.log('📧 Expected verification URL format:');
      console.log(`   ${frontendUrl}/verify-email?token=${sampleToken}`);
      console.log('');
    }
    
    // Test token lookup
    if (result.rows.length > 0) {
      const testToken = result.rows[0].verification_token;
      console.log('🧪 Testing token lookup...');
      const lookupResult = await pool.query(
        'SELECT id, email, email_verified FROM users WHERE verification_token = $1',
        [testToken]
      );
      
      if (lookupResult.rows.length > 0) {
        console.log('   ✅ Token lookup works! Found user:', lookupResult.rows[0].email);
      } else {
        console.log('   ❌ Token lookup failed! This is the problem.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTokens();
