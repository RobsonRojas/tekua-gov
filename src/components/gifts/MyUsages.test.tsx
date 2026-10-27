import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyUsages from './MyUsages';
import { apiClient } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  apiClient: { invoke: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    i18n: { language: 'pt-BR' },
  }),
}));

const usage = {
  id: 'u1',
  created_at: '2026-10-20T12:00:00Z',
  thanks_message: null,
  thanks_emojis: null,
  is_public: true,
  gift: { id: 'g1', title: { pt: 'Cesta de legumes', en: 'Vegetable basket' } },
};

describe('MyUsages — histórico do próprio membro (3.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists a used gift and shows that there is no gratitude yet', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: [usage], error: null } as never);

    render(<MyUsages />);

    expect(await screen.findByText('Cesta de legumes')).toBeInTheDocument();
    expect(screen.getByText('Sem agradecimento ainda.')).toBeInTheDocument();
  });

  it('saves a gratitude message and emojis through the owner-checked action', async () => {
    vi.mocked(apiClient.invoke)
      .mockResolvedValueOnce({ data: [usage], error: null } as never)
      .mockResolvedValueOnce({ data: { id: 'u1' }, error: null } as never)
      .mockResolvedValueOnce({ data: [usage], error: null } as never);

    render(<MyUsages />);
    fireEvent.click(await screen.findByRole('button', { name: 'Deixar agradecimento' }));

    fireEvent.change(screen.getByLabelText(/Mensagem de agradecimento/), { target: { value: 'Obrigada pela colheita!' } });
    fireEvent.click(screen.getByRole('button', { name: '🙏' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-gifts', 'updateUsageGratitude', {
        usageId: 'u1',
        thanksMessage: 'Obrigada pela colheita!',
        thanksEmojis: ['🙏'],
      });
    });
  });

  it('changing visibility calls the owner-checked visibility action (4.2 privacy)', async () => {
    vi.mocked(apiClient.invoke)
      .mockResolvedValueOnce({ data: [usage], error: null } as never)
      .mockResolvedValueOnce({ data: { id: 'u1', is_public: false }, error: null } as never)
      .mockResolvedValueOnce({ data: [{ ...usage, is_public: false }], error: null } as never);

    render(<MyUsages />);
    const toggle = await screen.findByRole('switch');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-gifts', 'setUsageVisibility', { usageId: 'u1', isPublic: false });
    });
  });
});
