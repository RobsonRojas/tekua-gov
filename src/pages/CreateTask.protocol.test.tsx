import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CreateTask from './CreateTask';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' }, profile: { role: 'member' } }) }));
vi.mock('../utils/activityLogger', () => ({ logActivity: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, d?: string) => (typeof d === 'string' ? d : _k), i18n: { language: 'pt' } }),
}));

const invoke = apiClient.invoke as unknown as ReturnType<typeof vi.fn>;

const fill = () => {
  fireEvent.change(screen.getByLabelText(/docs\.title|Título/), { target: { value: 'Limpar horta' } });
  fireEvent.change(screen.getByLabelText(/work\.description/), { target: { value: 'Tirar o mato' } });
  fireEvent.change(screen.getByLabelText(/work\.suggested/), { target: { value: '30' } });
};

const submit = async () => {
  fireEvent.click(screen.getByRole('button', { name: /work\.submit/ }));
  await waitFor(() => expect(invoke.mock.calls.some((c) => c[1] === 'createActivity')).toBe(true));
  return invoke.mock.calls.find((c) => c[1] === 'createActivity')![2];
};

const renderPage = () =>
  render(<BrowserRouter><ThemeProvider theme={createTheme()}><CreateTask /></ThemeProvider></BrowserRouter>);

describe('CreateTask — protocolo opcional', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoke.mockImplementation(async (_d: string, action: string) => {
      if (action === 'listProtocols') return { data: { protocols: [{ id: 'p1', title: 'POP da horta' }], canWrite: false }, error: null };
      return { data: [], error: null };
    });
  });

  it('cria sem protocolo quando nenhum é escolhido', async () => {
    renderPage();
    fill();
    const params = await submit();
    expect(params.protocolId).toBeNull();
  });

  it('envia o protocolo escolhido', async () => {
    renderPage();
    fill();
    await waitFor(() => expect(invoke).toHaveBeenCalledWith('api-governance', 'listProtocols'));
    fireEvent.change(screen.getByLabelText('Protocolo/POP (Opcional)'), { target: { value: 'horta' } });
    fireEvent.click(await screen.findByRole('option', { name: 'POP da horta' }));
    const params = await submit();
    expect(params.protocolId).toBe('p1');
  });
});
