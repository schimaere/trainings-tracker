import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Auth Configuration (lib/auth-config)', () => {
  const originalEnv = {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    Object.assign(process.env, originalEnv);
  });

  it('should export authOptions with correct structure', async () => {
    process.env.AUTH_SECRET = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

    const { authOptions } = await import('@/lib/auth-config');

    expect(authOptions).toBeDefined();
    expect(authOptions.secret).toBe('test-secret');
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.pages?.signIn).toBe('/auth/signin');
  });

  it('should fallback to NEXTAUTH_SECRET if AUTH_SECRET is not set', async () => {
    const originalAuthSecret = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    process.env.NEXTAUTH_SECRET = 'fallback-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

    vi.resetModules();
    const { authOptions } = await import('@/lib/auth-config');

    expect(authOptions.secret).toBe('fallback-secret');
    
    // Restore
    process.env.AUTH_SECRET = originalAuthSecret;
  });

  it('should handle missing Google OAuth credentials gracefully', async () => {
    process.env.AUTH_SECRET = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = '';
    process.env.GOOGLE_CLIENT_SECRET = '';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

    const { authOptions } = await import('@/lib/auth-config');

    expect(authOptions).toBeDefined();
    expect(authOptions.providers).toHaveLength(1);
    // Provider should still be created even with empty strings
    expect(authOptions.providers[0].id).toBe('google');
  });

  it('should have signIn callback that handles database operations', async () => {
    process.env.AUTH_SECRET = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

    const { authOptions } = await import('@/lib/auth-config');

    expect(authOptions.callbacks?.signIn).toBeDefined();
    expect(typeof authOptions.callbacks?.signIn).toBe('function');
  });

  it('should have session and jwt callbacks', async () => {
    process.env.AUTH_SECRET = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

    const { authOptions } = await import('@/lib/auth-config');

    expect(authOptions.callbacks?.session).toBeDefined();
    expect(authOptions.callbacks?.jwt).toBeDefined();
    expect(typeof authOptions.callbacks?.session).toBe('function');
    expect(typeof authOptions.callbacks?.jwt).toBe('function');
  });
});

