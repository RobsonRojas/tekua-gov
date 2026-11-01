import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Protocols from './Protocols';
import ProtocolSelect from '../components/work/ProtocolSelect';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_k: string, d?: string) => d ?? _k, i18n: { language: 'pt' } }),
}));

const invoke = apiClient.invoke as unknown as ReturnType<typeof vi.fn>;
const protocols = [
  { id: 'p1', title: 'POP da horta', status: 'active' },
  { id: 'p2', title: 'Protocolo de reuniões', status: 'active' },
];

const mockApi = (canWrite: boolean) =>
  invoke.mockImplementation(async (_d: string, action: string) => {
    if (action === 'listProtocols') return { data: { protocols, canWrite }, error: null };
    if (action === 'fetchProtocol') return { data: { id: 'p1', title: 'POP da horta', content: '**Passo 1**' }, error: null };
    return { data: { id: 'new' }, error: null };
  });

describe('Protocols page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista e pesquisa por título', async () => {
    mockApi(false);
    render(<Protocols />);
    expect(await screen.findByText('POP da horta')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Pesquisar por título'), { target: { value: 'reuni' } });
    expect(screen.queryByText('POP da horta')).toBeNull();
    expect(screen.getByText('Protocolo de reuniões')).toBeInTheDocument();
  });

  it('oculta os controles de escrita para membro comum', async () => {
    mockApi(false);
    render(<Protocols />);
    await screen.findByText('POP da horta');
    expect(screen.queryByRole('button', { name: 'Novo protocolo' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Arquivar' })).toBeNull();
  });

  it('mostra os controles e cria um protocolo para quem pode escrever', async () => {
    mockApi(true);
    render(<Protocols />);
    await screen.findByText('POP da horta');
    fireEvent.click(screen.getByRole('button', { name: 'Novo protocolo' }));
    fireEvent.change(await screen.findByLabelText(/Título/), { target: { value: 'Novo POP' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith('api-governance', 'createProtocol', expect.objectContaining({ title: 'Novo POP' })));
    expect((await screen.findAllByRole('button', { name: 'Arquivar' })).length).toBeGreaterThan(0);
  });

  it('abre o texto completo ao clicar em um protocolo', async () => {
    mockApi(false);
    render(<Protocols />);
    fireEvent.click(await screen.findByText('POP da horta'));
    expect(await screen.findByText('Passo 1')).toBeInTheDocument();
    expect(invoke).toHaveBeenCalledWith('api-governance', 'fetchProtocol', { id: 'p1' });
  });
});

describe('ProtocolSelect', () => {
  beforeEach(() => { vi.clearAllMocks(); mockApi(false); });

  it('filtra por título e devolve o id do protocolo escolhido', async () => {
    const onChange = vi.fn();
    render(<ProtocolSelect value={null} onChange={onChange} />);
    const input = screen.getByLabelText('Protocolo/POP (Opcional)');
    await waitFor(() => expect(invoke).toHaveBeenCalledWith('api-governance', 'listProtocols'));
    fireEvent.change(input, { target: { value: 'horta' } });
    fireEvent.click(await screen.findByRole('option', { name: 'POP da horta' }));
    expect(onChange).toHaveBeenCalledWith('p1');
    expect(screen.queryByRole('option', { name: 'Protocolo de reuniões' })).toBeNull();
  });

  it('mantém selecionável um protocolo atual que já foi arquivado', async () => {
    render(<ProtocolSelect value="old" onChange={() => {}} current={{ id: 'old', title: 'POP antigo' }} />);
    expect(await screen.findByDisplayValue('POP antigo')).toBeInTheDocument();
  });
});
