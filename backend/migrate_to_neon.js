/**
 * Run this script to migrate your local database schema to Neon.
 * Usage: node migrate_to_neon.js <neon_connection_string>
 * Example: node migrate_to_neon.js "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const neonConnectionString = process.argv[2];

if (!neonConnectionString) {
  console.error('❌ Please provide your Neon connection string as an argument.');
  console.error('   Usage: node migrate_to_neon.js "postgresql://user:pass@host/db?sslmode=require"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: neonConnectionString,
  ssl: { rejectUnauthorized: false }
});

// Order matters - run in dependency order
const schemaFiles = [
  'users.sql',
  'properties.sql',
  'bookings.sql',
  'payments.sql',
  'reviews.sql',
  'messages.sql',
  'user_features.sql',
  'chatbot.sql',
  'communication_settings.sql',
];

// Extra tables not in schema files - created inline
const extraTables = `
  CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, property_id)
  );

  CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) DEFAULT 'percentage',
    discount_value NUMERIC(10,2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS promo_code_properties (
    id SERIAL PRIMARY KEY,
    promo_code_id INTEGER REFERENCES promo_codes(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS disputes (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    raised_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    resolution TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS host_expenses (
    id SERIAL PRIMARY KEY,
    host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    category VARCHAR(100),
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS payouts (
    id SERIAL PRIMARY KEY,
    host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payout_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS pending_bookings (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER DEFAULT 1,
    total_price NUMERIC(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS host_reviews (
    id SERIAL PRIMARY KEY,
    host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    guest_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

async function runMigration() {
  console.log('🚀 Starting migration to Neon...\n');

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to Neon successfully!\n');

    for (const file of schemaFiles) {
      const filePath = path.join(__dirname, 'schema', file);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} (not found)`);
        continue;
      }

      try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`✅ ${file}`);
      } catch (err) {
        console.error(`❌ ${file}: ${err.message}`);
      }
    }

    // Create extra tables
    try {
      await pool.query(extraTables);
      console.log('✅ Created extra tables (faqs, favorites, promo_codes, etc.)');
    } catch (err) {
      console.log(`⚠️  Extra tables: ${err.message}`);
    }

    // Create chat_sessions and chat_messages tables
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL UNIQUE,
          user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ended_at TIMESTAMP NULL,
          message_count INTEGER DEFAULT 0,
          resolved BOOLEAN DEFAULT FALSE
        );
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);

        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
          sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot', 'admin')),
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

        CREATE TABLE IF NOT EXISTS chatbot_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          enabled BOOLEAN DEFAULT TRUE,
          welcome_message TEXT,
          fallback_message TEXT,
          response_delay INTEGER DEFAULT 3000,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO chatbot_settings (id, enabled, welcome_message, fallback_message, response_delay)
        VALUES (1, TRUE, 'Hello! I''m your smart assistant. How can I help you today?', 'I''m not sure I understand that. Could you rephrase that?', 3000)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('\u2705 Created chat_sessions, chat_messages, chatbot_settings tables');
    } catch (err) {
      console.log(`\u26a0\ufe0f  chat tables: ${err.message}`);
    }

    // Fix chat_messages sender constraint to allow 'admin'
    try {
      await pool.query(`
        ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_check;
        ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_sender_check 
          CHECK (sender IN ('user', 'bot', 'admin'));
      `);
      console.log('✅ Fixed chat_messages sender constraint');
    } catch (err) {
      console.log(`⚠️  chat_messages constraint: ${err.message}`);
    }

    // Add extra columns to chat_sessions
    try {
      await pool.query(`
        ALTER TABLE chat_sessions 
          ADD COLUMN IF NOT EXISTS feedback VARCHAR(20) CHECK (feedback IN ('positive', 'negative', 'none')),
          ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP NULL,
          ADD COLUMN IF NOT EXISTS admin_joined BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
      `);
      console.log('✅ Added chat_sessions extra columns');
    } catch (err) {
      console.log(`⚠️  chat_sessions columns: ${err.message}`);
    }

    console.log('\n🎉 Migration to Neon completed!');
    console.log('\nNext steps:');
    console.log('1. Copy your Neon connection string');
    console.log('2. Deploy backend to Render with Neon DB credentials');
    console.log('3. Deploy frontend to Vercel');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
