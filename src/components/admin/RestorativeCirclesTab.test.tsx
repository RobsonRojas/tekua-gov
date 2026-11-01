import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RestorativeCirclesTab from './RestorativeCirclesTab';
import { apiClient } from '../../lib/api';

vi.mock('../../lib/api', () => ({ apiClient: { invoke: vi.fn() } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, defaultValue?: string) => defaultValue ?? _key,
    i18n: { language: 'pt-BR' },
  }),
}));

const row = (id: string, status: 'open' | 'closed' | 'cancelled') => ({
  id, title: `Tema ${status}`, status, scheduled_at: '2030-11-20T22:00:00.000Z',
  created_at: '2030-11-01T12:00:00.000Z', author_name: 'Maria', share_token: `t-${id}`,
});

const invoke = apiClient.invoke as unknown as ReturnType<typeof vi.fn>;

describe('RestorativeCirclesTab details button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoke.mockImplementation(async (_d: string, action: string) =>
      action === 'fetchAllRestorativeCircles'
        ? { data: [row('1', 'open'), row('2', 'closed'), row('3', 'cancelled')], error: null }
        : { data: null, error: 'x' });
  });

  it('shows "Ver detalhes" for every status', async () => {
    render(<RestorativeCirclesTab />);
    await screen.findByText('Tema open');
    const buttons = screen.getAllByRole('button', { name: 'Ver detalhes' });
    expect(buttons).toHaveLength(3);
    buttons.forEach((b) => expect((b as HTMLButtonElement).disabled).toBe(false));
  });

  it('opens the dialog for the clicked row', async () => {
    render(<RestorativeCirclesTab />);
    await screen.findByText('Tema closed');
    fireEvent.click(screen.getAllByRole('button', { name: 'Ver detalhes' })[1]);
    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith('api-governance', 'fetchRestorativeCircleById', { id: '2' }));
  });
});
