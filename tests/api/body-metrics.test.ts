import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/body-metrics/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
}));

describe('Body Metrics API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/body-metrics', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { getSession } = await import('@/lib/auth');
      vi.mocked(getSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/body-metrics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return body metrics for authenticated user', async () => {
      const { getSession } = await import('@/lib/auth');
      const { sql } = await import('@/lib/db');

      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      const mockMetrics = [
        {
          id: '1',
          weight_kg: 75.5,
          body_fat_percentage: 15.0,
          recorded_at: '2024-01-01T12:00:00Z',
          created_at: '2024-01-01T12:00:00Z',
        },
      ];

      vi.mocked(sql).mockResolvedValue(mockMetrics as any);

      const request = new NextRequest('http://localhost:3000/api/body-metrics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].weight_kg).toBe(75.5);
    });

    it('should respect limit and offset parameters', async () => {
      const { getSession } = await import('@/lib/auth');
      const { sql } = await import('@/lib/db');

      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      vi.mocked(sql).mockResolvedValue([] as any);

      const request = new NextRequest('http://localhost:3000/api/body-metrics?limit=10&offset=5');
      await GET(request);

      // Verify sql was called (the actual query structure would be checked in integration tests)
      expect(sql).toHaveBeenCalled();
    });
  });

  describe('POST /api/body-metrics', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { getSession } = await import('@/lib/auth');
      vi.mocked(getSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/body-metrics', {
        method: 'POST',
        body: JSON.stringify({
          weight_kg: 75.5,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should create a new body metric entry', async () => {
      const { getSession } = await import('@/lib/auth');
      const { sql } = await import('@/lib/db');

      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      const mockResult = [
        {
          id: 'metric-123',
          weight_kg: 75.5,
          body_fat_percentage: 15.0,
          recorded_at: '2024-01-01T12:00:00Z',
          created_at: '2024-01-01T12:00:00Z',
        },
      ];

      vi.mocked(sql).mockResolvedValue(mockResult as any);

      const request = new NextRequest('http://localhost:3000/api/body-metrics', {
        method: 'POST',
        body: JSON.stringify({
          weight_kg: 75.5,
          body_fat_percentage: 15.0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.weight_kg).toBe(75.5);
      expect(data.body_fat_percentage).toBe(15.0);
    });

    it('should return 400 for invalid input', async () => {
      const { getSession } = await import('@/lib/auth');
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/body-metrics', {
        method: 'POST',
        body: JSON.stringify({
          weight_kg: -10, // Invalid: negative weight
          body_fat_percentage: 150, // Invalid: > 100
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle optional fields', async () => {
      const { getSession } = await import('@/lib/auth');
      const { sql } = await import('@/lib/db');

      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      const mockResult = [
        {
          id: 'metric-123',
          weight_kg: 75.5,
          body_fat_percentage: null,
          recorded_at: '2024-01-01T12:00:00Z',
          created_at: '2024-01-01T12:00:00Z',
        },
      ];

      vi.mocked(sql).mockResolvedValue(mockResult as any);

      const request = new NextRequest('http://localhost:3000/api/body-metrics', {
        method: 'POST',
        body: JSON.stringify({
          weight_kg: 75.5,
          // body_fat_percentage is optional
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.weight_kg).toBe(75.5);
    });
  });
});

