import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GratitudeFields from './GratitudeFields';
import MyUsages from './MyUsages';
import { emptyGratitude, type GratitudeValue } from './gratitudeConfig';
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

describe('Ingratidão é sempre privada (ingratidões privadas por enquanto)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('choosing ingratitude turns the public option off and blocks it', () => {
    let value: GratitudeValue = { ...emptyGratitude };
    const onChange = vi.fn((next: GratitudeValue) => {
      value = next;
    });
    const { rerender } = render(<GratitudeFields value={value} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ingratidão' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ sentiment: 'ingratitude', isPublic: false }));

    rerender(<GratitudeFields value={{ ...value, sentiment: 'ingratitude', isPublic: false }} onChange={onChange} />);
    expect(screen.getByRole('checkbox', { name: /dashboard público/ })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /dashboard público/ })).not.toBeChecked();
  });

  it('the history switch of an ingratitude record cannot make it public', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({
      data: [{
        id: 'u9',
        created_at: '2026-10-20T12:00:00Z',
        thanks_message: 'Não gostei',
        thanks_emojis: null,
        is_public: false,
        sentiment: 'ingratitude',
        gift: { id: 'g1', title: 'Cesta' },
      }],
      error: null,
    } as never);

    render(<MyUsages />);

    const toggle = await screen.findByRole('switch');
    expect(toggle).toBeDisabled();
    expect(screen.getByText('Ingratidão (sempre privada)')).toBeInTheDocument();
  });
});
