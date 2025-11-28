import { expect, afterEach, vi } from 'vitest';

// Mock environment variables for tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost/test';
process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'test-secret-key-for-testing-only';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret';

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

