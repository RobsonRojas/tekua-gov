import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RestorativeCircleDetailDialog from './RestorativeCircleDetailDialog';
import { apiClient } from '../../lib/api';

vi.mock('../../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, defaultValue?: string) => defaultValue ?? _key,
    i18n: { language: 'pt-BR' },
  }),
}));

const base = {
  id: 'c1',
  title: 'Uso da horta',
  description: 'Conflito coletivo',
  scheduled_at: '2030-11-20T22:00:00.000Z',
  location_or_link: 'Casa comum',
  status: 'open' as const,
  created_at: '2030-11-01T12:00:00.000Z',
  confirmed_pre_circles: true,
  share_token: 'tok',
  author_name: 'Maria',
};

const invoke = apiClient.invoke as unknown as ReturnType<typeof vi.fn>;

describe('RestorativeCircleDetailDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches by id and shows the filled fields and the protocol steps', async () => {
    invoke.mockResolvedValue({ data: base, error: null });
    render(<RestorativeCircleDetailDialog circleId="c1" onClose={() => {}} />);
    expect(await screen.findByText('Uso da horta')).toBeTruthy();
    expect(invoke).toHaveBeenCalledWith('api-governance', 'fetchRestorativeCircleById', { id: 'c1' });
    expect(screen.getByText('Conflito coletivo')).toBeTruthy();
    expect(screen.getByText('Casa comum')).toBeTruthy();
    expect(screen.getByText('Maria')).toBeTruthy();
    expect(screen.getByText('Confirmados pelo autor')).toBeTruthy();
    expect(screen.getByText('Passo 4 — Câmara Coletiva')).toBeTruthy();
  });

  it('shows "Não informado" for absent optional fields and unconfirmed pre-circles', async () => {
    invoke.mockResolvedValue({
      data: { ...base, description: null, location_or_link: null, confirmed_pre_circles: false },
      error: null,
    });
    render(<RestorativeCircleDetailDialog circleId="c1" onClose={() => {}} />);
    await waitFor(() => expect(screen.getAllByText('Não informado')).toHaveLength(2));
    expect(screen.getByText('Não confirmados')).toBeTruthy();
  });

  it('shows the loading state while the request is pending', async () => {
    invoke.mockReturnValue(new Promise(() => {}));
    render(<RestorativeCircleDetailDialog circleId="c1" onClose={() => {}} />);
    expect(await screen.findByRole('status')).toBeTruthy();
  });

  it('shows the API error', async () => {
    invoke.mockResolvedValue({ data: null, error: 'Forbidden' });
    render(<RestorativeCircleDetailDialog circleId="c1" onClose={() => {}} />);
    expect((await screen.findByRole('alert')).textContent).toContain('Forbidden');
  });

  it('does not fetch when closed and calls onClose from the close button', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<RestorativeCircleDetailDialog circleId={null} onClose={onClose} />);
    expect(invoke).not.toHaveBeenCalled();
    invoke.mockResolvedValue({ data: base, error: null });
    rerender(<RestorativeCircleDetailDialog circleId="c1" onClose={onClose} />);
    await screen.findByText('Uso da horta');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
