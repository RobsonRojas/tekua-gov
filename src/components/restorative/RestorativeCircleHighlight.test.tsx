import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RestorativeCircleHighlight from './RestorativeCircleHighlight';
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

const renderHighlight = () =>
  render(
    <MemoryRouter>
      <RestorativeCircleHighlight />
    </MemoryRouter>
  );

describe('RestorativeCircleHighlight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there is no open convocation', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: [], error: null } as never);

    const { container } = renderHighlight();

    await vi.waitFor(() => expect(apiClient.invoke).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the query fails, so the dashboard keeps working', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: 'boom' } as never);

    const { container } = renderHighlight();

    await vi.waitFor(() => expect(apiClient.invoke).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('highlights the open convocation with a link to its share page', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({
      data: [{ id: 'c1', title: 'Conflito na horta', scheduled_at: '2099-01-10T14:00:00.000Z', share_token: 'tok123' }],
      error: null,
    } as never);

    renderHighlight();

    expect(await screen.findByText('Conflito na horta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver convocação' })).toHaveAttribute('href', '/share/circle/tok123');
  });
});
