import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import TaskDetail from './TaskDetail';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('../context/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../components/work/TaskInteractions', () => ({ default: () => null }));
vi.mock('../components/work/DemandActionHistory', () => ({ default: () => null, DemandActionHistory: () => null }));

const OWNER = 'owner-1';
const base = {
  id: 'act-1',
  title: { pt: 'Tarefa 1', en: 'Task 1' },
  description: { pt: 'Descrição', en: 'Description' },
  type: 'task',
  status: 'open',
  requester_id: OWNER,
  executor_ids: [],
  reward_amount: 10,
  min_confirmations: 2,
  evidence: [],
  attachments: [],
  confirmations: [],
};

const renderWith = async (activity: Record<string, unknown>) => {
  (apiClient.invoke as any).mockImplementation((_d: string, action: string) =>
    Promise.resolve({ data: action === 'fetchActivityDetail' ? activity : action === 'listProtocols' ? { protocols: [{ id: 'p1', title: 'POP da horta' }], canWrite: false } : [], error: null }));
  const { useAuth } = await import('../context/useAuth');
  (useAuth as any).mockReturnValue({ user: { id: OWNER }, profile: { role: 'member' }, loading: false });
  render(
    <MemoryRouter initialEntries={['/tasks/act-1']}>
      <ThemeProvider theme={createTheme()}>
        <Routes><Route path="/tasks/:id" element={<TaskDetail />} /></Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
  fireEvent.click(await screen.findByRole('button', { name: /^(Editar|common\.edit)$/ }));
  await screen.findByText(/Editar Tarefa|work\.editTaskTitle/);
};

const minConfLabel = /Número de Confirmações|work\.minConfirmations/;

describe('TaskDetail — edição', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mostra o número de confirmações só com confirmação pela comunidade', async () => {
    await renderWith({ ...base, validation_method: 'community_consensus' });
    expect(screen.getByLabelText(minConfLabel, { exact: false })).toBeInTheDocument();
  });

  it('não mostra o número de confirmações com aprovação do solicitante', async () => {
    await renderWith({ ...base, validation_method: 'requester_approval' });
    expect(screen.queryByLabelText(minConfLabel, { exact: false })).toBeNull();
  });

  it('oferece o campo de protocolo na edição', async () => {
    await renderWith({ ...base, validation_method: 'requester_approval' });
    expect(screen.getByLabelText(/Protocolo\/POP|protocols\.selectLabel/)).toBeInTheDocument();
  });
});
