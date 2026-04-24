import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TasksBoard from './TasksBoard';
import { supabase } from '../lib/supabase';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ 
              data: [
                {
                  id: '1',
                  title: { pt: 'Tarefa Teste', en: 'Test Task' },
                  description: { pt: 'Desc Teste', en: 'Test Desc' },
                  type: 'task',
                  status: 'open',
                  reward_amount: 100,
                  requester: { full_name: 'Requester Test' },
                  confirmations: [{ count: 0 }]
                }
              ], 
              error: null 
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock useAuth
vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123' },
    profile: { full_name: 'Test User' }
  })
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt' }
  })
}));

describe('TasksBoard', () => {
  it('renders tasks from supabase', async () => {
    render(
      <BrowserRouter>
        <TasksBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tarefa Teste')).toBeDefined();
      expect(screen.getByText('100 $S')).toBeDefined();
    });
  });

  it('shows empty state when no tasks', async () => {
    // Override mock for this test
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    } as any);

    render(
      <BrowserRouter>
        <TasksBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('work.noItems')).toBeDefined();
    });
  });
});
