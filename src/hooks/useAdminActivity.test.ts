import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminActivity } from './useAdminActivity';
import { supabase } from '../lib/supabase';

const mockFrom = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockFrom),
  },
}));

describe('useAdminActivity Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches activity logs with default filters', async () => {
    const mockLogs = [
      { id: '1', action_type: 'auth', created_at: new Date().toISOString(), description: { pt: 'Login' }, profiles: { full_name: 'User 1', email: 'user1@example.com' } }
    ];
    
    vi.mocked(mockFrom.range).mockResolvedValue({
      data: mockLogs,
      error: null,
      count: 1
    } as any);

    const { result } = renderHook(() => useAdminActivity());

    // Wait for the initial fetch in useEffect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.logs).toEqual(mockLogs);
    expect(result.current.totalCount).toBe(1);
    expect(supabase.from).toHaveBeenCalledWith('activity_logs');
    expect(mockFrom.select).toHaveBeenCalledWith('*, profiles(full_name, email)', { count: 'exact' });
  });

  it('applies action type filter', async () => {
    const { result } = renderHook(() => useAdminActivity());

    await act(async () => {
      result.current.updateFilters({ actionType: 'vote' });
    });

    expect(mockFrom.eq).toHaveBeenCalledWith('action_type', 'vote');
  });

  it('applies date range filters', async () => {
    const { result } = renderHook(() => useAdminActivity());

    await act(async () => {
      result.current.updateFilters({ startDate: '2023-01-01', endDate: '2023-01-31' });
    });

    expect(mockFrom.gte).toHaveBeenCalledWith('created_at', '2023-01-01');
    expect(mockFrom.lte).toHaveBeenCalledWith('created_at', expect.stringContaining('2023-01-31'));
  });

  it('applies user search filter', async () => {
    const { result } = renderHook(() => useAdminActivity());

    await act(async () => {
      result.current.updateFilters({ userSearch: 'john' });
    });

    expect(mockFrom.or).toHaveBeenCalledWith('full_name.ilike.%john%,email.ilike.%john%', { foreignTable: 'profiles' });
  });
});
