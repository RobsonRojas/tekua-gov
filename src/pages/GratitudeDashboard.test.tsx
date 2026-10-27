import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GratitudeDashboard from './GratitudeDashboard';
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

describe('GratitudeDashboard (3.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the empty state when there are no public gratitudes', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: [], error: null } as never);

    render(<GratitudeDashboard />);

    expect(await screen.findByText('Ainda não há gratidões públicas.')).toBeInTheDocument();
    expect(apiClient.invoke).toHaveBeenCalledWith('api-gifts', 'fetchGratitudeDashboard');
  });

  it('lists the gratitudes returned by the public query, with message and emojis', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({
      data: [{
        id: 'u1',
        created_at: '2026-10-20T12:00:00Z',
        thanks_message: 'Obrigada pela colheita!',
        thanks_emojis: ['🙏'],
        consumer: { full_name: 'Ana' },
        gift: { id: 'g1', title: 'Cesta de legumes', provider: { full_name: 'Bia' } },
      }],
      error: null,
    } as never);

    render(<GratitudeDashboard />);

    expect(await screen.findByText(/Obrigada pela colheita!/)).toBeInTheDocument();
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
    expect(screen.getByText(/Cesta de legumes/)).toBeInTheDocument();
  });
});
