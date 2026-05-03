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
