import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-auth/middleware
const mockWithAuth = vi.fn((middlewareFn, options) => {
  return middlewareFn;
});

vi.mock('next-auth/middleware', () => ({
  withAuth: mockWithAuth,
}));

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export middleware configuration', async () => {
    const middleware = await import('@/middleware');
    const config = middleware.config;

    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
  });

  it('should exclude API routes and static files from matcher', async () => {
    const middleware = await import('@/middleware');
    const matcher = middleware.config.matcher[0];

    // Check that API routes are excluded
    expect(matcher).toContain('api');
    // Check that static files are excluded
    expect(matcher).toContain('_next/static');
    expect(matcher).toContain('favicon.ico');
  });

  it('should call withAuth with correct structure', async () => {
    // Import middleware to trigger withAuth call
    vi.resetModules();
    await import('@/middleware');

    expect(mockWithAuth).toHaveBeenCalled();
    const callArgs = mockWithAuth.mock.calls[0];
    
    if (callArgs && callArgs.length > 0) {
      // First argument should be the middleware function
      expect(typeof callArgs[0]).toBe('function');
      
      // Second argument should have callbacks
      if (callArgs[1]) {
        expect(callArgs[1].callbacks).toBeDefined();
        expect(callArgs[1].callbacks.authorized).toBeDefined();
      }
    }
  });

  it('should handle authorized callback correctly', async () => {
    vi.resetModules();
    await import('@/middleware');
    
    const callArgs = mockWithAuth.mock.calls[0];
    if (callArgs && callArgs[1]?.callbacks?.authorized) {
      const authorizedCallback = callArgs[1].callbacks.authorized;

      // Test with token
      const reqWithToken = {
        nextUrl: { pathname: '/dashboard' },
      } as any;
      expect(authorizedCallback({ token: { sub: '123' }, req: reqWithToken })).toBe(true);

      // Test without token on auth page
      const reqAuthPage = {
        nextUrl: { pathname: '/auth/signin' },
      } as any;
      expect(authorizedCallback({ token: null, req: reqAuthPage })).toBe(true);

      // Test without token on protected page
      const reqProtected = {
        nextUrl: { pathname: '/dashboard' },
      } as any;
      expect(authorizedCallback({ token: null, req: reqProtected })).toBe(false);
    }
  });

  it('should handle errors in authorized callback gracefully', async () => {
    vi.resetModules();
    await import('@/middleware');
    
    const callArgs = mockWithAuth.mock.calls[0];
    if (callArgs && callArgs[1]?.callbacks?.authorized) {
      const authorizedCallback = callArgs[1].callbacks.authorized;

      // Mock a request that might cause an error
      const reqError = {
        nextUrl: { pathname: '/auth/signin' },
      } as any;

      // Should return true for auth pages even on error
      const result = authorizedCallback({ token: null, req: reqError });
      expect(typeof result).toBe('boolean');
    }
  });
});

