import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/nutrition/route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
}));

describe('Nutrition API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/nutrition', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { getSession } = await import('@/lib/auth');
      vi.mocked(getSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/nutrition');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return nutrition entries for authenticated user', async () => {
      const { getSession } = await import('@/lib/auth');
      const { sql } = await import('@/lib/db');

      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as { user: { id: string; email: string } });

      const mockEntries = [
        {
          id: '1',
          food_name: 'Apple',
          calories: 95,
          protein_g: 0.5,
          carbs_g: 25,
          fat_g: 0.3,
          quantity: 1,
          unit: 'serving',
          consumed_at: '2024-01-01T12:00:00Z',
          created_at: '2024-01-01T12:00:00Z',
        },
      ];

      const mockTotals = [
        {
          total_calories: 95,
          total_protein: 0.5,
          total_carbs: 25,
          total_fat: 0.3,
        },
      ];

      const mockGoals = [
        {
          calories: 2000,
          protein_g: 150,
          carbs_g: 200,
          fat_g: 65,
        },
      ];

      // Mock sql to return different values for different calls
      // Mock sql calls - first call returns entries, second returns totals, third returns goals
      let callCount = 0;
      vi.mocked(sql).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return mockEntries as Array<{
          id: string;
          food_name: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          quantity: number;
          unit: string;
          consumed_at: string;
          created_at: string;
        }>;
        if (callCount === 2) return mockTotals as Array<{
          total_calories: number;
          total_protein: number;
          total_carbs: number;
          total_fat: number;
        }>;
        if (callCount === 3) return mockGoals as Array<{
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
        }>;
        return [] as unknown[];
      });

      const request = new NextRequest('http://localhost:3000/api/nutrition');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.entries).toBeDefined();
      expect(data.totals).toBeDefined();
      expect(data.goals).toBeDefined();
    });

    it('should filter by date when date parameter is provided', async () => {
      const { getSession } = await import('@/lib/auth');
      const { sql } = await import('@/lib/db');

      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as { user: { id: string; email: string } });

      let callCount = 0;
      vi.mocked(sql).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return [] as Array<{
          id: string;
          food_name: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          quantity: number;
          unit: string;
          consumed_at: string;
          created_at: string;
        }>;
        if (callCount === 2) return [{ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 }] as Array<{
          total_calories: number;
          total_protein: number;
          total_carbs: number;
          total_fat: number;
        }>;
        if (callCount === 3) return [{ calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65 }] as Array<{
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
        }>;
        return [] as unknown[];
      });

      const request = new NextRequest('http://localhost:3000/api/nutrition?date=2024-01-01');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(sql).toHaveBeenCalled();
    });
  });

  describe('POST /api/nutrition', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { getSession } = await import('@/lib/auth');
      vi.mocked(getSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          food_name: 'Apple',
          calories: 95,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should create a new food entry for authenticated user', async () => {
      const { getSession } = await import('@/lib/auth');
      const { sql } = await import('@/lib/db');

      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as { user: { id: string; email: string } });

      const mockResult = [
        {
          id: 'entry-123',
          food_name: 'Apple',
          calories: 95,
          protein_g: 0.5,
          carbs_g: 25,
          fat_g: 0.3,
          quantity: 1,
          unit: 'serving',
          consumed_at: '2024-01-01T12:00:00Z',
          created_at: '2024-01-01T12:00:00Z',
        },
      ];

      vi.mocked(sql).mockResolvedValue(mockResult as Array<{
        id: string;
        food_name: string;
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        quantity: number;
        unit: string;
        consumed_at: string;
        created_at: string;
      }>);

      const request = new NextRequest('http://localhost:3000/api/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          food_name: 'Apple',
          calories: 95,
          protein_g: 0.5,
          carbs_g: 25,
          fat_g: 0.3,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.food_name).toBe('Apple');
      expect(data.calories).toBe(95);
    });

    it('should return 400 for invalid input', async () => {
      const { getSession } = await import('@/lib/auth');
      vi.mocked(getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as { user: { id: string; email: string } });

      const request = new NextRequest('http://localhost:3000/api/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          food_name: '', // Invalid: empty string
          calories: -10, // Invalid: negative number
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});

