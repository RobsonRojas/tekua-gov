import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivityTab from './ActivityTab';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../lib/supabase';

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

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('ActivityTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default auth mock
    (useAuth as any).mockReturnValue({
      user: { id: 'test-user-id' }
    });

    // Default supabase mock
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockLimit = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'log-1',
          user_id: 'test-user-id',
          action_type: 'auth',
          description: { pt: 'Sessão Iniciada' },
          created_at: new Date().toISOString()
        }
      ],
      error: null
    });

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
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
    // Override supabase mock to return empty
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: mockLimit,
    });

    render(<ActivityTab />);
    
    await waitFor(() => {
      expect(screen.getByText('activity.noActivity')).toBeInTheDocument();
    });
  });
});
