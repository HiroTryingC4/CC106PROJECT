const { Pool } = require('pg');
const { createUserRepository } = require('../repo/userRepo');

// This test requires a test database to be set up
// Set TEST_DATABASE_URL environment variable or skip these tests
const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'localhost',
  user: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  database: process.env.TEST_DB_NAME || 'smartstay_test',
  port: parseInt(process.env.TEST_DB_PORT || '5432', 10)
};

const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';

(shouldRunIntegrationTests ? describe : describe.skip)('User Repository Integration Tests', () => {
  let pool;
  let userRepo;

  beforeAll(async () => {
    pool = new Pool(TEST_DB_CONFIG);
    
    // Create test tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'guest',
        verification_status VARCHAR(50) DEFAULT 'not_required',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.end();
  });

  beforeEach(async () => {
    userRepo = createUserRepository(pool);
    // Clear users table before each test
    await pool.query('DELETE FROM users');
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123!',
        phone: '1234567890',
        company: 'Test Corp',
        role: 'guest'
      };

      const user = await userRepo.createUser(userData);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('john@example.com');
      expect(user.firstName).toBe('John');
      expect(user.role).toBe('guest');
      expect(user).not.toHaveProperty('password');
    });

    it('should hash the password', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'TestPassword123!',
        role: 'guest'
      };

      const user = await userRepo.createUser(userData);
      
      // Verify password is hashed
      const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [user.id]);
      expect(result.rows[0].password_hash).not.toBe('TestPassword123!');
      expect(result.rows[0].password_hash).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      await userRepo.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123!',
        role: 'guest'
      });

      const user = await userRepo.findUserByEmail('john@example.com');

      expect(user).toBeDefined();
      expect(user.email).toBe('john@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await userRepo.findUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with correct password', async () => {
      await userRepo.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123!',
        role: 'guest'
      });

      const user = await userRepo.authenticateUser('john@example.com', 'TestPassword123!');

      expect(user).toBeDefined();
      expect(user.email).toBe('john@example.com');
    });

    it('should return null for incorrect password', async () => {
      await userRepo.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'TestPassword123!',
        role: 'guest'
      });

      const user = await userRepo.authenticateUser('john@example.com', 'WrongPassword123!');

      expect(user).toBeNull();
    });
  });
});
