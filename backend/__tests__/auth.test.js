const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Mock the user repository before requiring authRouter
const mockAuthenticateUser = jest.fn();
const mockFindUserByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockFindUserById = jest.fn();

jest.mock('../repo/userRepo', () => ({
  createUserRepository: jest.fn(() => ({
    authenticateUser: mockAuthenticateUser,
    findUserByEmail: mockFindUserByEmail,
    createUser: mockCreateUser,
    findUserById: mockFindUserById
  }))
}));

const authRouter = require('../routes/auth');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false
    }));
    
    app.locals.db = {};
    app.use('/api/auth', authRouter);

    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'guest',
        passwordHash: 'hashed_password'
      };

      mockAuthenticateUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 401 for invalid credentials', async () => {
      mockAuthenticateUser.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'guest',
        phone: '1234567890'
      };

      mockFindUserByEmail.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue(newUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'ValidPassword123!',
          phone: '1234567890',
          role: 'guest'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          email: 'john@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });

    it('should return 400 if password is weak', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password does not meet requirements');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 409 if user already exists', async () => {
      mockFindUserByEmail.mockResolvedValue({ id: 1, email: 'john@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'ValidPassword123!'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid session', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'guest',
        passwordHash: 'hashed_password'
      };

      mockFindUserById.mockResolvedValue(mockUser);
      mockAuthenticateUser.mockResolvedValue(mockUser);

      const agent = request.agent(app);
      
      // First login to create session
      await agent
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'ValidPassword123!' });

      // Then get current user
      const response = await agent.get('/api/auth/me');

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No authentication provided');
    });
  });
});
