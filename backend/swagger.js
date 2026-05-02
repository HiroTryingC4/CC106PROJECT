const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartStay Analytics API',
      version: '1.0.0',
      description: 'AI-enhanced Airbnb-style booking platform API documentation',
      contact: {
        name: 'SmartStay Team',
        email: 'support@smartstay.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.smartstay.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            company: { type: 'string', example: 'Tech Corp' },
            role: { type: 'string', enum: ['guest', 'host', 'admin', 'communication_admin'], example: 'guest' },
            verificationStatus: { type: 'string', example: 'not_required' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            hostId: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Cozy Downtown Apartment' },
            description: { type: 'string', example: 'Beautiful apartment in the heart of the city' },
            propertyType: { type: 'string', example: 'apartment' },
            address: { type: 'string', example: '123 Main St' },
            city: { type: 'string', example: 'New York' },
            state: { type: 'string', example: 'NY' },
            country: { type: 'string', example: 'USA' },
            zipCode: { type: 'string', example: '10001' },
            pricePerNight: { type: 'number', format: 'decimal', example: 150.00 },
            bedrooms: { type: 'integer', example: 2 },
            bathrooms: { type: 'integer', example: 1 },
            maxGuests: { type: 'integer', example: 4 },
            amenities: { type: 'array', items: { type: 'string' }, example: ['wifi', 'kitchen', 'parking'] },
            images: { type: 'array', items: { type: 'string' }, example: ['https://example.com/image1.jpg'] },
            status: { type: 'string', enum: ['active', 'inactive', 'pending'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            propertyId: { type: 'integer', example: 1 },
            guestId: { type: 'integer', example: 2 },
            checkInDate: { type: 'string', format: 'date', example: '2024-01-15' },
            checkOutDate: { type: 'string', format: 'date', example: '2024-01-20' },
            numberOfGuests: { type: 'integer', example: 2 },
            totalPrice: { type: 'number', format: 'decimal', example: 750.00 },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'], example: 'confirmed' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'An error occurred' },
            error: { type: 'object' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Properties', description: 'Property listing and management' },
      { name: 'Bookings', description: 'Booking management' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Reviews', description: 'Review and rating system' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Analytics', description: 'Analytics and reporting' },
      { name: 'Host', description: 'Host-specific operations' },
      { name: 'Chat', description: 'Messaging and chatbot' }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

module.exports = swaggerJsdoc(options);
