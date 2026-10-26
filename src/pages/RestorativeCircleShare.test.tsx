import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RestorativeCircleShare from './RestorativeCircleShare';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiClient: { invoke: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    i18n: { language: 'pt-BR' },
  }),
}));

const baseCircle = {
  id: 'c1',
  title: 'Conflito na horta',
  description: 'Encontro geral sobre a horta comunitária.',
  scheduled_at: '2099-01-10T14:00:00.000Z',
  status: 'open' as const,
};

const renderAt = (token: string) =>
  render(
    <MemoryRouter initialEntries={[`/share/circle/${token}`]}>
      <Routes>
        <Route path="/share/circle/:token" element={<RestorativeCircleShare />} />
      </Routes>
    </MemoryRouter>
  );

describe('RestorativeCircleShare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a generic message when the token matches no convocation', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: 'Restorative circle not found' } as never);

    renderAt('token-inexistente');

    expect(await screen.findByText('Convocação não encontrada.')).toBeInTheDocument();
    expect(screen.queryByText('Conflito na horta')).not.toBeInTheDocument();
  });

  it('shows the convocation details for a valid token', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: baseCircle, error: null } as never);

    renderAt('token-valido');

    expect(await screen.findByText('Conflito na horta')).toBeInTheDocument();
    expect(screen.getByText('Encontro geral sobre a horta comunitária.')).toBeInTheDocument();
    expect(screen.getByText('Aberta')).toBeInTheDocument();
  });

  it('renders the location as a link only when it is an http(s) URL', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({
      data: { ...baseCircle, location_or_link: 'https://meet.example.org/horta' },
      error: null,
    } as never);

    renderAt('token-link');

    const link = await screen.findByRole('link', { name: 'https://meet.example.org/horta' });
    expect(link).toHaveAttribute('href', 'https://meet.example.org/horta');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not turn a javascript: location into a link', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({
      data: { ...baseCircle, location_or_link: 'javascript:alert(1)' },
      error: null,
    } as never);

    renderAt('token-perigoso');

    expect(await screen.findByText(/javascript:alert\(1\)/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'javascript:alert(1)' })).not.toBeInTheDocument();
  });

  it('requests the convocation by the token from the URL', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: baseCircle, error: null } as never);

    renderAt('meu-token');

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-governance', 'fetchRestorativeCircleByToken', { token: 'meu-token' });
    });
  });
});
