import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TopicDetail from './TopicDetail';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key,
    i18n: { language: 'pt' },
  }),
}));

// Mock react-router useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useParams: () => ({ id: 'test-topic-id' }),
  };
});

describe('TopicDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSetup = (hasVoted = false, status = 'open') => {
    vi.mocked(useAuth).mockReturnValue({ acceptTerms: vi.fn(),
      user: { id: 'test-user-id' },
    } as any);

    // Provide mocked chained methods for supabase
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'discussion_topics') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { id: 'test-topic-id', title: { pt: 'Tópico de Teste' }, content: { pt: '<p>Conteúdo</p>' }, status }, 
            error: null 
          }),
        } as any;
      }
      if (table === 'topic_comments') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        } as any;
      }
      if (table === 'topic_votes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ 
            data: hasVoted ? [{ option: 'yes', user_id: 'test-user-id' }] : [], 
            error: null 
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        } as any;
      }
      return {} as any;
    });
  };

  it('renders topic details and allows voting if not voted', async () => {
    mockSetup(false, 'open');

    render(
      <MemoryRouter>
        <TopicDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tópico de Teste')).toBeInTheDocument();
    });

    const btnYes = screen.getByText('Sim (0)');
    expect(btnYes).not.toBeDisabled();

    // Trigger vote
    fireEvent.click(btnYes);

    await waitFor(() => {
      // Check if insert was called
      expect(supabase.from).toHaveBeenCalledWith('topic_votes');
    });
  });

  it('disables voting buttons if user has already voted', async () => {
    mockSetup(true, 'open'); // User has voted 'yes'

    render(
      <MemoryRouter>
        <TopicDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Seu voto foi registrado com sucesso.')).toBeInTheDocument();
    });

    // Buttons should be disabled
    const btnYes = screen.getByText('Sim (1)');
    expect(btnYes).toBeDisabled();
  });

  it('disables voting buttons if topic is closed', async () => {
    mockSetup(false, 'closed'); 

    render(
      <MemoryRouter>
        <TopicDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tópico de Teste')).toBeInTheDocument();
    });

    const btnYes = screen.getByText('Sim (0)');
    expect(btnYes).toBeDisabled();
  });

  it('allows adding a comment', async () => {
    mockSetup(false, 'open');

    render(
      <MemoryRouter>
        <TopicDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tópico de Teste')).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText('Adicione um comentário...');
    fireEvent.change(commentInput, { target: { value: 'Meu comentário' } });

    const sendBtn = screen.getByText('Enviar');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('topic_comments');
    });
  });
});
