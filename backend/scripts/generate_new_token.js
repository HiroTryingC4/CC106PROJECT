const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smartstay',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

async function generateNewToken() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('\n❌ Please provide an email address');
    console.log('Usage: node generate_new_token.js your-email@example.com\n');
    process.exit(1);
  }

  try {
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, email, first_name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length === 0) {
      console.log(`\n❌ No user found with email: ${email}\n`);
      process.exit(1);
    }

    const user = userCheck.rows[0];

    if (user.email_verified) {
      console.log(`\n✅ User ${email} is already verified!`);
      console.log('You can login now.\n');
      process.exit(0);
    }

    // Generate new token
    const newToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update database
    await pool.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [newToken, tokenExpires, user.id]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${newToken}`;

    console.log('\n✅ New verification token generated!\n');
    console.log('User:', user.email);
    console.log('Name:', user.first_name);
    console.log('Token:', newToken);
    console.log('Expires:', tokenExpires);
    console.log('\n📧 Verification URL:');
    console.log(verificationUrl);
    console.log('\n💡 Copy this URL and paste it in your browser to verify your email.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

generateNewToken();
