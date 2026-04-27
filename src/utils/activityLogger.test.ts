import { describe, it, expect, vi } from 'vitest';
import { logActivity } from './activityLogger';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

describe('activityLogger', () => {
  it('invokes the api-audit function to log activity', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: { success: true }, error: null });

    await logActivity('user-123', 'auth', { pt: 'Teste' }, { meta: 'data' });

    expect(apiClient.invoke).toHaveBeenCalledWith('api-audit', 'logActivity', {
      userId: 'user-123',
      action: 'auth',
      description: { pt: 'Teste' },
      metadata: { meta: 'data' }
    });
  });
});
