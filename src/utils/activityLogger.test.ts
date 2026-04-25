import { describe, it, expect, vi } from 'vitest';
import { logActivity } from './activityLogger';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('activityLogger', () => {
  it('inserts a log into the database', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({
      insert: mockInsert,
    });

    await logActivity('user-123', 'auth', { pt: 'Teste' });

    expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    expect(mockInsert).toHaveBeenCalledWith([
      {
        user_id: 'user-123',
        action_type: 'auth',
        description: { pt: 'Teste' },
        ip_address: null,
      }
    ]);
  });
});
