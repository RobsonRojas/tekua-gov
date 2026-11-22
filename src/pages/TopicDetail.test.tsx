import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TopicDetail from './TopicDetail';
import { useAuth } from '../context/useAuth';
import { apiClient } from '../lib/api';

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  apiClient: { invoke: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string, opts?: Record<string, unknown>) =>
      (defaultValue || key).replace(/\{\{(\w+)\}\}/g, (_m, k) => String(opts?.[k] ?? '')),
    i18n: { language: 'pt' },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as object),
    useParams: () => ({ id: 'test-topic-id' }),
  };
});

const writeText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

const comments = [
  {
    id: 'c1', user_id: 'u2', content: { pt: 'Primeiro comentário' }, created_at: '2026-01-01T10:00:00Z',
    parent_id: null, mentioned_user_ids: [], profiles: { full_name: 'Ana', avatar_url: '' },
  },
  {
    id: 'c2', user_id: 'u3', content: { pt: 'Concordo @Ana' }, created_at: '2026-01-01T11:00:00Z',
    parent_id: 'c1', mentioned_user_ids: ['u2'], profiles: { full_name: 'Bia', avatar_url: '' },
  },
];

describe('TopicDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSetup = (hasVoted = false, status = 'open', withComments = false, isAdmin = false, reward = 0) => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'test-user-id' }, profile: { roles: isAdmin ? ['admin'] : ['member'] } } as never);
    vi.mocked(apiClient.invoke).mockImplementation(async (_fn: string, action: string) => {
      if (action === 'fetchTopicDetail') {
        return {
          data: {
            topic: { id: 'test-topic-id', title: { pt: 'Tópico de Teste' }, content: { pt: '<p>Conteúdo</p>' }, status, reward_amount: reward },
            comments: withComments ? comments : [],
            stats: { yes: hasVoted ? 1 : 0, no: 0, abstain: 0 },
            userVoted: hasVoted,
            mentionedProfiles: { u2: 'Ana' },
          },
          error: null,
        };
      }
      return { data: {}, error: null };
    });
  };

  const renderPage = () => render(<MemoryRouter><TopicDetail /></MemoryRouter>);
  const calls = (action: string) =>
    vi.mocked(apiClient.invoke).mock.calls.filter((c) => c[1] === action);

  it('renders topic details and allows voting if not voted', async () => {
    mockSetup(false, 'open');
    renderPage();
    await waitFor(() => expect(screen.getByText('Tópico de Teste')).toBeInTheDocument());

    const btnYes = screen.getByText('Sim (0)');
    expect(btnYes).not.toBeDisabled();
    fireEvent.click(btnYes);

    await waitFor(() => expect(calls('castVote')).toHaveLength(1));
    expect(calls('castVote')[0][2]).toEqual({ topicId: 'test-topic-id', option: 'yes' });
  });

  it('disables voting buttons if user has already voted', async () => {
    mockSetup(true, 'open');
    renderPage();
    await waitFor(() => expect(screen.getByText('Seu voto foi registrado com sucesso.')).toBeInTheDocument());
    expect(screen.getByText('Sim (1)')).toBeDisabled();
  });

  it('disables voting buttons if topic is closed', async () => {
    mockSetup(false, 'closed');
    renderPage();
    await waitFor(() => expect(screen.getByText('Tópico de Teste')).toBeInTheDocument());
    expect(screen.getByText('Sim (0)')).toBeDisabled();
  });

  it('allows adding a comment', async () => {
    mockSetup(false, 'open');
    renderPage();
    await waitFor(() => expect(screen.getByText('Tópico de Teste')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Adicione um comentário...'), { target: { value: 'Meu comentário' } });
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => expect(calls('addComment')).toHaveLength(1));
    const params = calls('addComment')[0][2] as Record<string, unknown>;
    expect(params.topicId).toBe('test-topic-id');
    expect(params.content).toEqual({ pt: 'Meu comentário', en: 'Meu comentário' });
    expect(params.parentId).toBeUndefined();
  });

  it('shows replies under their parent comment and highlights mentions', async () => {
    mockSetup(false, 'open', true);
    renderPage();
    await waitFor(() => expect(screen.getByText('Primeiro comentário')).toBeInTheDocument());

    const mention = screen.getByText('@Ana');
    expect(mention).toBeInTheDocument();
    expect(mention.tagName).toBe('SPAN');
    const order = screen.getAllByText(/Primeiro comentário|Concordo/).map((n) => n.textContent);
    expect(order[0]).toBe('Primeiro comentário');
  });

  it('sends a reply with the parent comment id', async () => {
    mockSetup(false, 'open', true);
    renderPage();
    await waitFor(() => expect(screen.getByText('Primeiro comentário')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Responder')[0]);
    fireEvent.change(screen.getByPlaceholderText('Escreva uma resposta...'), { target: { value: 'Minha resposta' } });
    fireEvent.click(screen.getAllByText('Enviar')[0]);

    await waitFor(() => expect(calls('addComment')).toHaveLength(1));
    const params = calls('addComment')[0][2] as Record<string, unknown>;
    expect(params.parentId).toBe('c1');
    expect(params.content).toEqual({ pt: 'Minha resposta', en: 'Minha resposta' });
  });

  it('hides reply buttons and blocks new comments when topic is closed', async () => {
    mockSetup(false, 'closed', true);
    renderPage();
    await waitFor(() => expect(screen.getByText('Primeiro comentário')).toBeInTheDocument());

    expect(screen.queryByText('Responder')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Adicione um comentário...')).toBeDisabled();
  });

  it('copia o link da pauta', async () => {
    mockSetup(false, 'open');
    renderPage();
    await waitFor(() => expect(screen.getByText('Tópico de Teste')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Copiar link da pauta'));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/voting/test-topic-id`));
    expect(await screen.findByText('Link copiado!')).toBeInTheDocument();
  });

  it('copia o link de um comentário', async () => {
    mockSetup(false, 'open', true);
    renderPage();
    await waitFor(() => expect(screen.getByText('Primeiro comentário')).toBeInTheDocument());
    fireEvent.click(screen.getAllByLabelText('Copiar link do comentário')[0]);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/voting/test-topic-id#comment-c1`));
  });

  it('mostra o aviso quando o voto gera surreais', async () => {
    mockSetup(false, 'open', false, false, 5);
    vi.mocked(apiClient.invoke).mockImplementation(async (_fn: string, action: string) => {
      if (action === 'castVote') return { data: { reward: { amount: 5 } }, error: null };
      return {
        data: {
          topic: { id: 'test-topic-id', title: { pt: 'Tópico de Teste' }, content: { pt: '<p>x</p>' }, status: 'open', reward_amount: 5 },
          comments: [], stats: { yes: 0, no: 0, abstain: 0 }, userVoted: false, mentionedProfiles: {},
        },
        error: null,
      };
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Tópico de Teste')).toBeInTheDocument());
    expect(screen.getByText('+5 surreais por participar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sim (0)'));
    expect(await screen.findByText('Você recebeu 5 surreais por participar!')).toBeInTheDocument();
  });

  it('só administradores veem Editar Pauta e enviam a recompensa', async () => {
    mockSetup(false, 'open', false, false);
    const { unmount } = renderPage();
    await waitFor(() => expect(screen.getByText('Tópico de Teste')).toBeInTheDocument());
    expect(screen.queryByText('Editar Pauta')).not.toBeInTheDocument();
    unmount();

    mockSetup(false, 'open', false, true, 2);
    renderPage();
    await waitFor(() => expect(screen.getByText('Tópico de Teste')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Editar Pauta'));
    const reward = await screen.findByLabelText('Recompensa por interação (surreais)');
    fireEvent.change(reward, { target: { value: '7,5' } });
    fireEvent.click(screen.getByText('Salvar'));
    await waitFor(() => expect(calls('updateTopic')).toHaveLength(1));
    expect((calls('updateTopic')[0][2] as Record<string, unknown>).rewardAmount).toBe(7.5);
  });

  it('exibe mensagem amigável no notice ao falhar voto ou comentário', async () => {
    mockSetup(false, 'open', false, false);
    vi.mocked(apiClient.invoke).mockImplementation(async (_fn: string, action: string) => {
      if (action === 'castVote') return { data: null, error: 'Could not find column' };
      if (action === 'addComment') return { data: null, error: 'Error adding comment' };
      return {
        data: {
          topic: { id: 'test-topic-id', title: { pt: 'Tópico de Teste' }, content: { pt: '<p>x</p>' }, status: 'open' },
          comments: [], stats: { yes: 0, no: 0, abstain: 0 }, userVoted: false, mentionedProfiles: {},
        },
        error: null,
      };
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Tópico de Teste')).toBeInTheDocument());
    
    // Testa falha no voto
    fireEvent.click(screen.getByText('Sim (0)'));
    expect(await screen.findByText('Could not find column')).toBeInTheDocument();

    // Testa falha no comentário
    fireEvent.change(screen.getByPlaceholderText('Adicione um comentário...'), { target: { value: 'Falha' } });
    fireEvent.click(screen.getByText('Enviar'));
    expect(await screen.findByText('Error adding comment')).toBeInTheDocument();
  });
});
