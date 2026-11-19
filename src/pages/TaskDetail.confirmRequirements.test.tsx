import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskDetail from './TaskDetail';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('../context/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../components/work/TaskInteractions', () => ({ default: () => null }));
vi.mock('../components/work/DemandActionHistory', () => ({ default: () => null, DemandActionHistory: () => null }));

const task = (over: any = {}) => ({
  id: 'act-1',
  title: { pt: 'Tarefa 1', en: 'Task 1' },
  description: { pt: 'desc', en: 'desc' },
  type: 'task',
  status: 'pending_validation',
  requester_id: 'req-1',
  executor_ids: ['exec-1'],
  reward_amount: 10,
  validation_method: 'community_consensus',
  min_confirmations: 1,
  evidence: [],
  attachments: [],
  confirmations: [],
  ...over,
});

const setup = async (userId: string, activity: any) => {
  (apiClient.invoke as any).mockImplementation((_d: string, action: string) =>
    Promise.resolve({ data: action === 'fetchActivityDetail' ? activity : null, error: null }));
  const { useAuth } = await import('../context/useAuth');
  (useAuth as any).mockReturnValue({ user: { id: userId }, profile: { role: 'member' }, loading: false });
  render(
    <MemoryRouter initialEntries={['/tasks/act-1']}>
      <ThemeProvider theme={createTheme()}>
        <Routes><Route path="/tasks/:id" element={<TaskDetail />} /></Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('TaskDetail — confirm requirements list', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists the unmet requirement when an executor sees the disabled button', async () => {
    await setup('exec-1', task());
    const item = await screen.findByTestId('confirm-requirement-notExecutor');
    expect(item.getAttribute('data-met')).toBe('false');
    const btn = screen.getByRole('button', { name: /work\.confirm|Confirmar Tarefa/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('hides the list when the button is enabled', async () => {
    await setup('other-1', task());
    const btn = await screen.findByRole('button', { name: /work\.confirm|Confirmar Tarefa/i });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByTestId('confirm-requirement-notExecutor')).toBeNull();
  });

  it('shows the already-confirmed requirement as unmet', async () => {
    await setup('other-1', task({ user_has_confirmed: true }));
    const item = await screen.findByTestId('confirm-requirement-notConfirmedYet');
    expect(item.getAttribute('data-met')).toBe('false');
  });
});
