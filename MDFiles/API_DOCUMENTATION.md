# SmartStay API Documentation

## Overview
The SmartStay API provides a comprehensive set of endpoints for managing an AI-enhanced booking platform similar to Airbnb. This RESTful API supports property listings, bookings, payments, reviews, and analytics.

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.smartstay.com/api`

## Interactive Documentation
Access the interactive Swagger UI documentation at:
- **Local**: http://localhost:5000/api-docs
- **Production**: https://api.smartstay.com/api-docs

The Swagger UI allows you to:
- Browse all available endpoints
- View request/response schemas
- Test API calls directly from the browser
- Download OpenAPI specification

## Authentication

### Methods
The API supports two authentication methods:

1. **Session-based (Cookie)**
   - Automatically set after login
   - Used for browser-based requests
   - Cookie name: `connect.sid`

2. **Token-based (Bearer)**
   - Include in Authorization header
   - Format: `Authorization: Bearer <token>`
   - Obtained from login/register response

### Example
```bash
# Using Bearer token
curl -H "Authorization: Bearer token_123_1234567890" \
  http://localhost:5000/api/auth/me

# Using session cookie
curl --cookie "connect.sid=..." \
  http://localhost:5000/api/auth/me
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Users (`/api/users`)
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Properties (`/api/properties`)
- `GET /properties` - List all properties (with filters)
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property (host only)
- `PUT /properties/:id` - Update property (host only)
- `DELETE /properties/:id` - Delete property (host only)
- `POST /properties/upload` - Upload property image

### Bookings (`/api/bookings`)
- `GET /bookings` - List bookings
- `GET /bookings/:id` - Get booking details
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Payments (`/api/payments`)
- `POST /payments` - Process payment
- `GET /payments/:id` - Get payment details
- `GET /payments/booking/:bookingId` - Get payments for booking

### Reviews (`/api/reviews`)
- `GET /reviews` - List reviews
- `GET /reviews/property/:propertyId` - Get property reviews
- `POST /reviews` - Create review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Admin (`/api/admin`)
- `GET /admin/users` - User management
- `GET /admin/properties` - Property management
- `GET /admin/bookings` - Booking management
- `GET /admin/analytics` - System analytics
- `POST /admin/host-verification` - Verify hosts

### Host (`/api/host`)
- `GET /host/dashboard` - Host dashboard data
- `GET /host/properties` - Host's properties
- `GET /host/bookings` - Host's bookings
- `GET /host/analytics` - Host analytics
- `POST /host/verification` - Submit verification

### Analytics (`/api/analytics`)
- `GET /analytics/overview` - System overview
- `GET /analytics/revenue` - Revenue analytics
- `GET /analytics/bookings` - Booking analytics
- `GET /analytics/properties` - Property analytics

### Chat (`/api/chat`)
- `GET /chat/messages` - Get messages
- `POST /chat/messages` - Send message
- `GET /chat/conversations` - List conversations
- `POST /chat/bot` - Chatbot interaction

## Request/Response Format

### Standard Response Format
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error Response Format
```json
{
  "message": "Error description",
  "error": { /* error details (dev only) */ }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Excluded**: OPTIONS requests, property listings, booking listings
- **Headers**: 
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Data Models

### User
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "guest",
  "verificationStatus": "not_required",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Property
```json
{
  "id": 1,
  "hostId": 1,
  "title": "Cozy Apartment",
  "description": "Beautiful downtown apartment",
  "type": "apartment",
  "address": "123 Main St",
  "city": "New York",
  "pricePerNight": 150.00,
  "bedrooms": 2,
  "bathrooms": 1,
  "maxGuests": 4,
  "amenities": ["wifi", "kitchen"],
  "images": ["https://..."],
  "status": "active"
}
```

### Booking
```json
{
  "id": 1,
  "propertyId": 1,
  "guestId": 2,
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-20",
  "numberOfGuests": 2,
  "totalPrice": 750.00,
  "status": "confirmed"
}
```

## Password Requirements
Passwords must meet the following criteria:
- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

## CORS Policy
Allowed origins:
- `http://localhost:3000`
- `http://localhost:5173`
- Configured production URLs

Credentials are supported for cross-origin requests.

## File Uploads
- **Max file size**: 10MB
- **Supported formats**: Images (JPEG, PNG, WebP)
- **Storage**: Cloudinary
- **Endpoint**: `POST /api/properties/upload`

## Pagination
For endpoints that return lists, use query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Example:
```
GET /api/properties?page=2&limit=10
```

## Filtering & Search
Many endpoints support filtering:
- `search` - Text search
- `minPrice` / `maxPrice` - Price range
- `type` - Property type
- `status` - Status filter

Example:
```
GET /api/properties?search=apartment&minPrice=100&maxPrice=200
```

## Best Practices
1. Always include authentication for protected endpoints
2. Handle rate limiting gracefully
3. Validate input data before sending
4. Use HTTPS in production
5. Store tokens securely (never in localStorage for sensitive apps)
6. Implement proper error handling
7. Use pagination for large datasets

## Support
For API support and questions:
- Email: support@smartstay.com
- Documentation: http://localhost:5000/api-docs
- GitHub Issues: [Repository URL]

## Changelog
### Version 1.0.0 (Current)
- Initial API release
- Authentication system
- Property management
- Booking system
- Payment processing
- Review system
- Admin panel
- Analytics
- Chatbot integration
