import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WorkWall from './WorkWall';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt' }
  }),
}));

const mockActivities = [
  { id: '1', title: { pt: 'Tarefa Pendente', en: 'Pending Task' }, status: 'pending_approval', type: 'task', requester_id: 'user-2' },
  { id: '2', title: { pt: 'Tarefa Aberta', en: 'Open Task' }, status: 'open', type: 'task', requester_id: 'user-2' },
];

describe('WorkWall Moderation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show the Moderation tab for admin users', async () => {
    (useAuth as any).mockReturnValue({ user: { id: 'user-1', role: 'admin' } });
    (apiClient.invoke as any).mockResolvedValue({ data: mockActivities, error: null });

    render(
      <BrowserRouter>
        <WorkWall />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('work.moderation')).toBeDefined();
    });
  });

  it('should show the Moderation tab for transversal_council users', async () => {
    (useAuth as any).mockReturnValue({ user: { id: 'user-1', role: 'transversal_council' } });
    (apiClient.invoke as any).mockResolvedValue({ data: mockActivities, error: null });

    render(
      <BrowserRouter>
        <WorkWall />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('work.moderation')).toBeDefined();
    });
  });

  it('should NOT show the Moderation tab for regular members', async () => {
    (useAuth as any).mockReturnValue({ user: { id: 'user-1', role: 'member' } });
    (apiClient.invoke as any).mockResolvedValue({ data: mockActivities, error: null });

    render(
      <BrowserRouter>
        <WorkWall />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('work.moderation')).toBeNull();
    });
  });
});
