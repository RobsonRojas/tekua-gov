import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GratitudeFields from './GratitudeFields';
import { emptyGratitude, type GratitudeValue } from './gratitudeConfig';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    i18n: { language: 'pt-BR' },
  }),
}));

describe('GratitudeFields', () => {
  it('does not allow more than 5 emojis (5.2)', () => {
    let value: GratitudeValue = { ...emptyGratitude, emojis: ['🙏', '❤️', '🌱', '🤝', '🌟'] };
    const onChange = vi.fn((next: GratitudeValue) => {
      value = next;
    });
    render(<GratitudeFields value={value} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '🎉' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('limits the message to 280 characters (5.2)', () => {
    const onChange = vi.fn();
    render(<GratitudeFields value={emptyGratitude} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/Mensagem de agradecimento/), { target: { value: 'a'.repeat(400) } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ message: 'a'.repeat(280) }));
  });
});
