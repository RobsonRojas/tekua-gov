import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './api';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock global fetch
global.fetch = vi.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default environment variables
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('should use native fetch and succeed with valid session', async () => {
    const mockSession = { access_token: 'valid-token' };
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: mockSession }, error: null });
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' }),
    });

    const result = await apiClient.invoke('api-audit', 'fetchLogs');

    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/api-audit',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer valid-token',
        }),
      })
    );
    expect(result.data).toBe('success');
  });

  it('should fallback to anon key when session fetch times out', async () => {
    // Mock getSession to never resolve (simulate hang)
    (supabase.auth.getSession as any).mockReturnValue(new Promise(() => {}));
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: 'success-with-anon' }),
    });

    // Use a shorter timeout for testing if we could, but the code uses 500ms
    // We'll wait for the result
    const result = await apiClient.invoke('api-audit', 'fetchLogs');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-anon-key',
        }),
      })
    );
    expect(result.data).toBe('success-with-anon');
  });

  it('should return error when fetch fails', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null });
    
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const result = await apiClient.invoke('api-audit', 'fetchLogs');

    expect(result.error).toContain('HTTP 500');
    expect(result.data).toBeNull();
  });
});
