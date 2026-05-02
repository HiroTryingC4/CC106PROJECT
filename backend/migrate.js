const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Pool } = require('pg');

const DEFAULT_SCHEMA_FILES = [
  'users.sql',
  'properties.sql',
  'bookings.sql',
  'payments.sql',
  'messages.sql',
  'user_features.sql',
  'reviews.sql',
  'admin_data.sql',
  'host_data.sql',
  'chatbot.sql'
];

const loadEnv = () => {
  const envPath = path.resolve(__dirname, '.env');
  const envConfig = fs.existsSync(envPath)
    ? dotenv.parse(fs.readFileSync(envPath))
    : {};

  Object.assign(process.env, envConfig);

  return {
    ...process.env,
    ...envConfig
  };
};

const getSchemaFiles = (schemaDir) => {
  const configured = process.env.DB_MIGRATION_FILES
    ? process.env.DB_MIGRATION_FILES.split(',').map((name) => name.trim()).filter(Boolean)
    : [];

  const orderedNames = configured.length > 0 ? configured : DEFAULT_SCHEMA_FILES;

  return orderedNames
    .map((name) => path.resolve(schemaDir, name))
    .filter((filePath) => fs.existsSync(filePath));
};

const runMigrations = async (pool, options = {}) => {
  const schemaDir = options.schemaDir || path.resolve(__dirname, 'schema');
  const schemaFiles = getSchemaFiles(schemaDir);

  if (schemaFiles.length === 0) {
    console.warn('No schema files found to migrate.');
    return [];
  }

  const migratedFiles = [];

  for (const schemaFile of schemaFiles) {
    const sql = fs.readFileSync(schemaFile, 'utf-8');
    await pool.query(sql);
    migratedFiles.push(path.basename(schemaFile));
    console.log(`Applied migration: ${path.basename(schemaFile)}`);
  }

  return migratedFiles;
};

const createPoolFromEnv = () => {
  const resolvedEnv = loadEnv();

  return new Pool({
    host: resolvedEnv.DB_HOST || 'localhost',
    user: resolvedEnv.DB_USER || 'postgres',
    password: resolvedEnv.DB_PASSWORD || 'postgres',
    database: resolvedEnv.DB_NAME || 'smartstay',
    port: parseInt(resolvedEnv.DB_PORT || '5432', 10)
  });
};

const runCliMigrations = async () => {
  const pool = createPoolFromEnv();

  try {
    await runMigrations(pool);
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  runCliMigrations();
}

module.exports = {
  runMigrations,
  createPoolFromEnv
};
