# Testing Documentation

## Overview
This project includes comprehensive automated testing for both backend and frontend components.

## Backend Testing

### Setup
```bash
cd backend
npm install
```

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

**Run integration tests (requires test database):**
```bash
npm run test:integration
```

### Test Structure
- `__tests__/auth.test.js` - Authentication route tests
- `__tests__/validation.test.js` - Password validation tests
- `__tests__/userRepo.integration.test.js` - Database integration tests

### Integration Tests Setup
Integration tests require a PostgreSQL test database. Set these environment variables:

```bash
TEST_DB_HOST=localhost
TEST_DB_USER=postgres
TEST_DB_PASSWORD=postgres
TEST_DB_NAME=smartstay_test
TEST_DB_PORT=5432
RUN_INTEGRATION_TESTS=true
```

## Frontend Testing

### Setup
```bash
cd frontend
npm install
```

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm test -- --watch
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

### Test Structure
- `src/__tests__/contexts/` - Context tests (AuthContext)
- `src/__tests__/pages/` - Page component tests
- `src/__tests__/components/` - Reusable component tests

## Test Coverage Goals
- Routes: 80%+ coverage
- Repositories: 80%+ coverage
- Utilities: 90%+ coverage
- React Components: 70%+ coverage
- Context Providers: 80%+ coverage

## Writing New Tests

### Backend Example
```javascript
describe('Feature Name', () => {
  it('should do something', async () => {
    // Arrange
    const mockData = { /* ... */ };
    
    // Act
    const result = await someFunction(mockData);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### Frontend Example
```javascript
import { render, screen } from '@testing-library/react';

describe('Component Name', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## CI/CD Integration
Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Backend Tests
  run: cd backend && npm test

- name: Run Frontend Tests
  run: cd frontend && npm test -- --coverage
```

## Best Practices
1. Write tests before fixing bugs (TDD)
2. Keep tests isolated and independent
3. Use descriptive test names
4. Mock external dependencies
5. Aim for high coverage but focus on critical paths
6. Run tests before committing code
