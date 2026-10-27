import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkWallAssistant from './WorkWallAssistant';
import { chatWithGemini } from '../../lib/gemini';
import { apiClient } from '../../lib/api';

vi.mock('../../lib/gemini', () => ({
  chatWithGemini: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  apiClient: { invoke: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    i18n: { language: 'pt-BR' },
  }),
}));

type StreamEvent = { type: 'text'; content: string } | { type: 'draft'; draft: unknown };

/** Simula a resposta do ai-handler: eventos de texto e, opcionalmente, um rascunho. */
const mockAssistantReply = (events: StreamEvent[]) => {
  vi.mocked(chatWithGemini).mockResolvedValue({
    async *[Symbol.asyncIterator]() {
      for (const event of events) yield event;
    },
  } as never);
};

const draft = { title: 'Limpar a horta', description: 'Retirar o mato da área 2', rewardAmount: 30 };

const askFor = async (text: string) => {
  fireEvent.change(screen.getByPlaceholderText('Pergunte sobre o mural ou descreva a tarefa…'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
};

describe('WorkWallAssistant — criação por rascunho', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the draft and does not create the task before the member clicks "Criar" (4.1)', async () => {
    mockAssistantReply([
      { type: 'text', content: 'Rascunho pronto para revisar.' },
      { type: 'draft', draft },
    ]);

    render(<WorkWallAssistant />);
    await askFor('quero criar uma tarefa para limpar a horta');

    expect(await screen.findByText('Rascunho de tarefa (ainda não criada)')).toBeInTheDocument();
    expect(screen.getByText('Limpar a horta')).toBeInTheDocument();
    expect(apiClient.invoke).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-work', 'createActivity', expect.objectContaining({
        title: 'Limpar a horta',
        rewardAmount: 30,
        type: 'task',
      }));
    });
  });

  it('never creates a task from the assistant text alone (4.1)', async () => {
    mockAssistantReply([{ type: 'text', content: 'Pronto! Sua tarefa já foi criada.' }]);

    render(<WorkWallAssistant />);
    await askFor('crie a tarefa, por favor');

    expect(await screen.findByText(/Pronto! Sua tarefa já foi criada/)).toBeInTheDocument();
    expect(apiClient.invoke).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Criar' })).not.toBeInTheDocument();
  });

  it('cancelling discards the draft without calling the backend (4.2)', async () => {
    mockAssistantReply([{ type: 'draft', draft }]);

    render(<WorkWallAssistant />);
    await askFor('tarefa da horta');
    await screen.findByText('Rascunho de tarefa (ainda não criada)');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Rascunho de tarefa (ainda não criada)')).not.toBeInTheDocument();
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('changing the subject discards the pending draft without calling the backend (4.2)', async () => {
    mockAssistantReply([{ type: 'draft', draft }]);

    render(<WorkWallAssistant />);
    await askFor('tarefa da horta');
    await screen.findByText('Rascunho de tarefa (ainda não criada)');

    mockAssistantReply([{ type: 'text', content: 'Claro, o mural mostra as tarefas por coluna.' }]);
    await askFor('como funciona o mural?');

    await waitFor(() => {
      expect(screen.queryByText('Rascunho de tarefa (ainda não criada)')).not.toBeInTheDocument();
    });
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('keeps the draft for correction when the backend refuses the creation (4.3)', async () => {
    mockAssistantReply([{ type: 'draft', draft }]);
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: 'Reward amount must be a positive number' } as never);

    render(<WorkWallAssistant />);
    await askFor('tarefa da horta');
    await screen.findByText('Rascunho de tarefa (ainda não criada)');

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Reward amount must be a positive number')).toBeInTheDocument();
    expect(screen.getByText('Limpar a horta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeEnabled();
  });

  it('blocks "Criar" while the reward is not positive, checked on the client (4.4)', async () => {
    mockAssistantReply([{ type: 'draft', draft: { ...draft, rewardAmount: 0 } }]);

    render(<WorkWallAssistant />);
    await askFor('tarefa da horta');
    await screen.findByText('Rascunho de tarefa (ainda não criada)');

    expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
    expect(screen.getByText('A recompensa precisa ser um valor positivo.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('blocks "Criar" when the title is empty (4.4)', async () => {
    mockAssistantReply([{ type: 'draft', draft: { ...draft, title: '   ' } }]);

    render(<WorkWallAssistant />);
    await askFor('tarefa da horta');
    await screen.findByText('Rascunho de tarefa (ainda não criada)');

    expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
    expect(screen.getByText('Informe o título da tarefa.')).toBeInTheDocument();
  });
});
