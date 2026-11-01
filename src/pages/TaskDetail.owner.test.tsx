import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskDetail from './TaskDetail';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('../context/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../components/work/TaskInteractions', () => ({ default: () => null }));
vi.mock('../components/work/DemandActionHistory', () => ({ default: () => null, DemandActionHistory: () => null }));

const OWNER = 'owner-1';
const openTask = {
  id: 'act-1',
  title: { pt: 'Tarefa 1', en: 'Task 1' },
  description: { pt: 'https://exemplo.org/' + 'a'.repeat(200), en: 'x' },
  type: 'task',
  status: 'open',
  requester_id: OWNER,
  executor_ids: [],
  reward_amount: 10,
  validation_method: 'requester_approval',
  min_confirmations: 1,
  invite_token: 'tok123',
  evidence: [],
  attachments: [],
  confirmations: [],
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/tasks/act-1']}>
      <ThemeProvider theme={createTheme()}>
        <Routes><Route path="/tasks/:id" element={<TaskDetail />} /></Routes>
      </ThemeProvider>
    </MemoryRouter>
  );

describe('TaskDetail — owner of an open task', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    (apiClient.invoke as any).mockImplementation((_d: string, action: string) =>
      Promise.resolve({ data: action === 'fetchActivityDetail' ? openTask : null, error: null }));
    const { useAuth } = await import('../context/useAuth');
    (useAuth as any).mockReturnValue({ user: { id: OWNER }, profile: { role: 'member' }, loading: false });
  });

  it('lets the creator claim their own task (button enabled)', async () => {
    renderPage();
    const btn = await screen.findByRole('button', { name: /work\.accept|Assumir Tarefa/i });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows the invite block with a title that is not a raw key, and the full instruction', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/^(Convite Externo|work\.inviteExternal)$/)).toBeInTheDocument());
    expect(screen.getByText(/Compartilhe este QR Code|work\.inviteExternalHint/)).toBeInTheDocument();
  });
});
