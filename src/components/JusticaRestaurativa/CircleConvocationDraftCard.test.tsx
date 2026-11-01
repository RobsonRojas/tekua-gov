import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CircleConvocationDraftCard from './CircleConvocationDraftCard';

const full = {
  title: 'Uso da horta',
  scheduledAt: '2030-11-20T22:00:00.000Z',
  description: 'Conflito coletivo sobre a rotina',
  locationOrLink: 'Casa comum',
};

describe('CircleConvocationDraftCard', () => {
  it('shows every field of the draft', () => {
    render(<CircleConvocationDraftCard draft={full} onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Uso da horta')).toBeTruthy();
    expect(screen.getByText('Conflito coletivo sobre a rotina')).toBeTruthy();
    expect(screen.getByText('Casa comum')).toBeTruthy();
    expect(screen.getByText(/2030/)).toBeTruthy();
  });

  it('omits absent optional fields', () => {
    render(
      <CircleConvocationDraftCard
        draft={{ title: 'Tema', scheduledAt: full.scheduledAt }}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText('Descrição')).toBeNull();
    expect(screen.queryByText('Local ou link')).toBeNull();
  });

  it('calls the right callback on confirm and on cancel', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<CircleConvocationDraftCard draft={full} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar convocação' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows the error and keeps the buttons available', () => {
    render(<CircleConvocationDraftCard draft={full} error="Você já tem uma convocação aberta." onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('alert').textContent).toContain('convocação aberta');
    expect((screen.getByRole('button', { name: 'Cancelar' }) as HTMLButtonElement).disabled).toBe(false);
  });
});
