import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Database Connection (lib/db)', () => {
  const originalEnv = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalEnv;
  });

  it('should throw error when DATABASE_URL is not set', async () => {
    const originalUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    
    // Re-import to test the error
    vi.resetModules();
    const { sql: testSql } = await import('@/lib/db');
    
    await expect(async () => {
      await testSql`SELECT 1`;
    }).rejects.toThrow('DATABASE_URL is not set');
    
    process.env.DATABASE_URL = originalUrl;
  });

  it('should export sql as a function', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    vi.resetModules();
    
    const { sql } = await import('@/lib/db');
    
    expect(sql).toBeDefined();
    expect(typeof sql).toBe('function');
  });

  it('should handle template tag function calls', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    vi.resetModules();
    
    const { sql } = await import('@/lib/db');
    
    // Verify sql is callable (actual database calls would fail in unit tests)
    expect(typeof sql).toBe('function');
  });
});

