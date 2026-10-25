import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskDetail from './TaskDetail';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../components/work/TaskInteractions', () => ({
  default: () => null,
}));

vi.mock('../components/work/DemandActionHistory', () => ({
  default: () => null,
  DemandActionHistory: () => null,
}));

const theme = createTheme();

const WORKER_ID = 'worker-1';

const inProgressActivity = {
  id: 'act-1',
  title: { pt: 'Tarefa 1', en: 'Task 1' },
  description: { pt: 'Descricao', en: 'Description' },
  type: 'task',
  status: 'in_progress',
  requester_id: 'requester-1',
  worker_id: WORKER_ID,
  executor_ids: [WORKER_ID],
  reward_amount: 100,
  validation_method: 'community_consensus',
  min_confirmations: 1,
  evidence: [],
  attachments: [],
  confirmations: [],
  user_has_confirmed: false,
};

describe('TaskDetail — completion in a single step', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.invoke as any).mockImplementation((_domain: string, action: string) => {
      if (action === 'fetchActivityDetail') {
        return Promise.resolve({ data: inProgressActivity, error: null });
      }
      if (action === 'completeTask') {
        return Promise.resolve({ data: { success: true }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/tasks/act-1']}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/tasks/:id" element={<TaskDetail />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );

  it('completes the task directly, without sending the member to the proof page', async () => {
    const { useAuth } = await import('../context/useAuth');
    (useAuth as any).mockReturnValue({
      user: { id: WORKER_ID },
      profile: { role: 'member' },
      loading: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /work.completeTask/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /work.completeTask/i }));

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-work', 'completeTask', {
        activityId: 'act-1',
      });
    });
  });

  it('offers the optional evidence as a secondary action', async () => {
    const { useAuth } = await import('../context/useAuth');
    (useAuth as any).mockReturnValue({
      user: { id: WORKER_ID },
      profile: { role: 'member' },
      loading: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /work.attachEvidence/i })).toBeInTheDocument();
    });
  });

  it('shows the mutual-trust notice', async () => {
    const { useAuth } = await import('../context/useAuth');
    (useAuth as any).mockReturnValue({
      user: { id: WORKER_ID },
      profile: { role: 'member' },
      loading: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText(/work.trustNotice/).length).toBeGreaterThan(0);
    });
  });
});

describe('TaskDetail — confirmation by the requester or an admin who is also an executor', () => {
  const pendingActivity = (overrides: Record<string, unknown>) => ({
    ...inProgressActivity,
    status: 'pending_validation',
    validation_method: 'requester_approval',
    requester_id: 'requester-1',
    worker_id: 'requester-1',
    executor_ids: ['requester-1'],
    ...overrides,
  });

  const mockActivity = (activity: unknown) => {
    vi.mocked(apiClient.invoke).mockImplementation(((_domain: string, action: string) => {
      if (action === 'fetchActivityDetail') {
        return Promise.resolve({ data: activity, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }) as never);
  };

  const mockUser = async (userId: string, role = 'member') => {
    const { useAuth } = await import('../context/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: { id: userId },
      profile: { role },
      loading: false,
    } as never);
  };

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/tasks/act-1']}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/tasks/:id" element={<TaskDetail />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enables the confirm button for the requester when they are also an executor', async () => {
    await mockUser('requester-1');
    mockActivity(pendingActivity({}));

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'work.confirm' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'work.confirm' })).toBeEnabled();
  });

  it('keeps the confirm button disabled for an executor who is not the requester', async () => {
    await mockUser(WORKER_ID);
    mockActivity(
      pendingActivity({
        validation_method: 'community_consensus',
        requester_id: null,
        worker_id: WORKER_ID,
        executor_ids: [WORKER_ID],
      })
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'work.confirm' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'work.confirm' })).toBeDisabled();
  });

  it('enables the confirm button for an admin who is also an executor in requester_approval', async () => {
    await mockUser(WORKER_ID, 'admin');
    mockActivity(
      pendingActivity({
        requester_id: 'requester-1',
        worker_id: WORKER_ID,
        executor_ids: [WORKER_ID],
      })
    );

    renderPage();

    const button = await screen.findByRole('button', { name: /work\.confirm|Forçar Confirmação \(Admin\)/ });
    expect(button).toBeEnabled();
  });

  it('keeps the confirm button disabled for an admin who is an executor in community_consensus', async () => {
    await mockUser(WORKER_ID, 'admin');
    mockActivity(
      pendingActivity({
        validation_method: 'community_consensus',
        requester_id: null,
        worker_id: WORKER_ID,
        executor_ids: [WORKER_ID],
      })
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'work.confirm' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'work.confirm' })).toBeDisabled();
  });
});
