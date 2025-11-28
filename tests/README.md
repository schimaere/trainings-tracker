# Tests

This directory contains tests for the Training Tracker application.

## Setup

Install dependencies:
```bash
npm install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Test Structure

- `lib/` - Tests for library functions (database, auth config)
- `api/` - Tests for API routes
- `middleware.test.ts` - Tests for Next.js middleware
- `setup.ts` - Test setup and configuration

## Test Coverage

The test suite covers:

1. **Database Connection (`lib/db.test.ts`)**
   - Lazy initialization
   - Error handling when DATABASE_URL is missing
   - Connection reuse
   - Template tag function calls

2. **Auth Configuration (`lib/auth-config.test.ts`)**
   - Configuration structure
   - Environment variable fallbacks
   - Callback functions

3. **Middleware (`middleware.test.ts`)**
   - Route matching
   - Authorization logic
   - Error handling

4. **API Routes**
   - Authentication checks
   - Request validation
   - Success responses
   - Error handling

## Writing New Tests

When adding new features, add corresponding tests:

1. Create test files in the appropriate directory
2. Use Vitest's `describe` and `it` blocks
3. Mock external dependencies (database, auth)
4. Test both success and error cases
5. Use descriptive test names

Example:
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

