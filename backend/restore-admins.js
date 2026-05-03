const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const crypto = require('crypto');

const envPath = path.resolve(__dirname, '.env');
const envConfig = fs.existsSync(envPath)
  ? dotenv.parse(fs.readFileSync(envPath))
  : {};

Object.assign(process.env, envConfig);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smartstay',
  port: parseInt(process.env.DB_PORT || '5432', 10)
});

// Simple password hash function (for demo purposes)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function restoreAdmins() {
  const client = await pool.connect();
  
  try {
    // Hash password for admin accounts
    const hashedPassword = hashPassword('admin123');

    // Insert admin user
    const admin = await client.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, role, 
        verification_status, created_at, updated_at
      ) VALUES (
        'admin@smartstay.com', $1, 'Admin', 'User', 'admin',
        'verified', NOW(), NOW()
      )
      ON CONFLICT (email) DO UPDATE 
      SET role = 'admin', verification_status = 'verified'
      RETURNING id, email, role
    `, [hashedPassword]);

    console.log('✅ Admin account restored:', admin.rows[0]);

    // Insert communication admin user
    const comAdmin = await client.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, role, 
        verification_status, created_at, updated_at
      ) VALUES (
        'comadmin@smartstay.com', $1, 'Communication', 'Admin', 'communication_admin',
        'verified', NOW(), NOW()
      )
      ON CONFLICT (email) DO UPDATE 
      SET role = 'communication_admin', verification_status = 'verified'
      RETURNING id, email, role
    `, [hashedPassword]);

    console.log('✅ Communication Admin account restored:', comAdmin.rows[0]);

    // Show all users
    console.log('\n=== All Users ===');
    const allUsers = await client.query(`
      SELECT id, email, role, first_name, last_name 
      FROM users 
      ORDER BY id
    `);
    allUsers.rows.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Name: ${u.first_name} ${u.last_name}`);
    });

  } catch (error) {
    console.error('❌ Error restoring admins:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

restoreAdmins().catch(console.error);
