import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import RegisterWork from './RegisterWork';
import CreateTask from './CreateTask';
import CreateDemand from './CreateDemand';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(() => ({ neq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) })),
    rpc: vi.fn(() => Promise.resolve({ data: 'id', error: null })),
  },
}));
vi.mock('../lib/api', () => ({ apiClient: { invoke: vi.fn(() => Promise.resolve({ data: [], error: null })) } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: { id: 'user-1' }, profile: { role: 'member' } }) }));
vi.mock('../utils/activityLogger', () => ({ logActivity: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, d?: string) => (typeof d === 'string' ? d : _k), i18n: { language: 'pt' } }),
}));

const wrap = (ui: React.ReactElement) =>
  render(<BrowserRouter><ThemeProvider theme={createTheme()}>{ui}</ThemeProvider></BrowserRouter>);

describe('avisos de confirmação nos formulários', () => {
  it('criação de tarefa explica a aprovação do solicitante e não oferece o campo sem efeito', () => {
    wrap(<CreateTask />);
    expect(screen.getByText(/o solicitante \(ou um administrador\) confirma/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Confirmações Necessárias|work\.minConfirmations/)).toBeNull();
  });

  it('criação de demanda explica a aprovação do solicitante e não oferece o campo sem efeito', () => {
    wrap(<CreateDemand />);
    expect(screen.getByText(/o solicitante \(ou um administrador\) confirma/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Confirmações Necessárias|work\.minConfirmations/)).toBeNull();
  });

  it('registro de trabalho mostra o destino e muda a regra conforme o beneficiário', () => {
    wrap(<RegisterWork />);
    expect(screen.getByText(/vai direto para a coluna "Para Validar"/)).toBeInTheDocument();
    expect(screen.getByText(/membros da Vila e do Conselho/)).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByLabelText('work.beneficiary'));
    fireEvent.click(screen.getByRole('option', { name: 'work.otherMember' }));
    expect(screen.getByText(/somente o membro indicado como beneficiário/)).toBeInTheDocument();
    expect(screen.queryByText(/membros da Vila e do Conselho/)).toBeNull();
  });
});
