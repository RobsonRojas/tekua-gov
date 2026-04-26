import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivityTab from './ActivityTab';
import { useAuth } from '../../context/useAuth';
import { apiClient } from '../../lib/api';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt' }
  }),
}));

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

describe('ActivityTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default auth mock
    (useAuth as any).mockReturnValue({
      user: { id: 'test-user-id' }
    });

    // Default apiClient mock
    (apiClient.invoke as any).mockResolvedValue({
      data: [
        {
          id: 'log-1',
          actor_id: 'test-user-id',
          action: 'auth',
          description: { pt: 'Sessão Iniciada' },
          created_at: new Date().toISOString()
        }
      ],
      error: null
    });
  });

  it('renders the activity tab title', async () => {
    render(<ActivityTab />);
    
    expect(screen.getByText('profile.activity')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Sessão Iniciada')).toBeInTheDocument();
    });
  });

  it('shows empty state when no activity is found', async () => {
    // Override apiClient mock to return empty
    (apiClient.invoke as any).mockResolvedValue({ data: [], error: null });

    render(<ActivityTab />);
    
    await waitFor(() => {
      expect(screen.getByText('activity.noActivity')).toBeInTheDocument();
    });
  });
});
