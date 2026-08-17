import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ShareSurrealLanding from './ShareSurrealLanding';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ShareSurrealLanding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders shared surreal receipt details when shareId is valid', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({
      data: {
        id: 'tx-share-1',
        amount: 48,
        description: 'Surreais recebidos por contribuição',
        createdAt: new Date().toISOString(),
        senderName: 'Ana Oliveira',
        recipientName: 'Bruno Souza',
      },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/share/surreal/tx-share-1']}>
        <Routes>
          <Route path="/share/surreal/:shareId" element={<ShareSurrealLanding />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Você recebeu 48 $S')).toBeInTheDocument();
    });

    expect(screen.getByText('Recebido de Ana Oliveira')).toBeInTheDocument();
    expect(screen.getByText('Surreais recebidos por contribuição')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'shareSurreal.cta' })).toBeInTheDocument();
  });

  it('shows an error when the share link is invalid', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: 'Link inválido ou expirado.' });

    render(
      <MemoryRouter initialEntries={['/share/surreal/invalid-share-id']}>
        <Routes>
          <Route path="/share/surreal/:shareId" element={<ShareSurrealLanding />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar este compartilhamento.')).toBeInTheDocument();
    });

    expect(screen.getByText('Ir para Login')).toBeInTheDocument();
  });
});
