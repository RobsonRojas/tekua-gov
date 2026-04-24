import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMembers } from './useMembers';
import { supabase } from '../lib/supabase';

const mockFrom = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockFrom),
  },
}));

describe('useMembers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches members on mount', async () => {
    const mockData = [{ id: '1', full_name: 'John Doe', role: 'member' }];
    vi.mocked(mockFrom.order).mockResolvedValue({ data: mockData, error: null } as any);

    const { result } = renderHook(() => useMembers());

    // Wait for the initial fetch in useEffect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.members).toEqual(mockData);
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockFrom.select).toHaveBeenCalledWith('*');
  });

  it('updates a member role', async () => {
    vi.mocked(mockFrom.eq).mockResolvedValue({ error: null } as any);
    vi.mocked(mockFrom.order).mockResolvedValue({ data: [], error: null } as any);

    const { result } = renderHook(() => useMembers());

    await act(async () => {
      const success = await result.current.updateMember('1', { role: 'admin' });
      expect(success).toBe(true);
    });

    expect(mockFrom.update).toHaveBeenCalledWith({ role: 'admin' });
    expect(mockFrom.eq).toHaveBeenCalledWith('id', '1');
  });

  it('handles fetch errors', async () => {
    const errorMessage = 'Database error';
    vi.mocked(mockFrom.order).mockResolvedValue({ data: null, error: { message: errorMessage } } as any);

    const { result } = renderHook(() => useMembers());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe(errorMessage);
  });
});
