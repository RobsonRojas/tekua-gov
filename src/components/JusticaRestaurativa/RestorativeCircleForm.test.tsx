import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RestorativeCircleForm from './RestorativeCircleForm';
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

const futureLocal = () => {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const pastLocal = () => '2000-01-01T10:00';

const fillForm = (overrides: { title?: string; date?: string; preCircles?: boolean; privacy?: boolean } = {}) => {
  fireEvent.change(screen.getByLabelText(/Tema do círculo/), { target: { value: overrides.title ?? 'Conflito na horta' } });
  fireEvent.change(screen.getByLabelText(/Data e horário/), { target: { value: overrides.date ?? futureLocal() } });
  if (overrides.preCircles ?? true) fireEvent.click(screen.getByLabelText(/pré-círculos individuais foram considerados/));
  if (overrides.privacy ?? true) fireEvent.click(screen.getByLabelText(/não identifica as partes/));
};

describe('RestorativeCircleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not call the backend while required fields are missing', async () => {
    render(<RestorativeCircleForm onBack={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Convocar círculo' }));

    expect(await screen.findByText('Informe o tema do círculo.')).toBeInTheDocument();
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('blocks a date in the past and does not create the convocation', async () => {
    render(<RestorativeCircleForm onBack={() => {}} />);
    fillForm({ date: pastLocal() });

    fireEvent.click(screen.getByRole('button', { name: 'Convocar círculo' }));

    expect(await screen.findByText('A data e o horário precisam ser futuros.')).toBeInTheDocument();
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('requires confirmation of the pre-circles and of the privacy notice', async () => {
    render(<RestorativeCircleForm onBack={() => {}} />);
    fillForm({ preCircles: false, privacy: false });

    fireEvent.click(screen.getByRole('button', { name: 'Convocar círculo' }));

    expect(await screen.findByText('Confirme que os pré-círculos individuais foram considerados.')).toBeInTheDocument();
    expect(screen.getByText('Confirme que a descrição não identifica as partes envolvidas.')).toBeInTheDocument();
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('creates the convocation with the confirmed pre-circles and shows the share link', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: { id: 'c1', share_token: 'abc123' }, error: null } as never);
    render(<RestorativeCircleForm onBack={() => {}} />);
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: 'Convocar círculo' }));

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith(
        'api-governance',
        'createRestorativeCircle',
        expect.objectContaining({ title: 'Conflito na horta', confirmedPreCircles: true })
      );
    });
    expect(await screen.findByDisplayValue(/\/share\/circle\/abc123$/)).toBeInTheDocument();
  });

  it('shows the backend error and keeps the form for correction', async () => {
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: null, error: 'You already have an open restorative circle' } as never);
    render(<RestorativeCircleForm onBack={() => {}} />);
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: 'Convocar círculo' }));

    expect(await screen.findByText('You already have an open restorative circle')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tema do círculo/)).toHaveValue('Conflito na horta');
  });

  it('blocks submission while the title or description contains an e-mail address (3.3)', async () => {
    render(<RestorativeCircleForm onBack={() => {}} />);
    fillForm();
    fireEvent.change(screen.getByLabelText(/Descrição geral/), { target: { value: 'Contato: ana.silva@mail.com.br' } });

    expect(screen.getAllByText('Remova os endereços de email do tema e da descrição.').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Convocar círculo' }));

    await waitFor(() => expect(screen.getAllByText('Remova os endereços de email do tema e da descrição.').length).toBeGreaterThan(0));
    expect(apiClient.invoke).not.toHaveBeenCalled();
  });

  it('shows the visibility notice before any input', () => {
    render(<RestorativeCircleForm onBack={() => {}} />);
    expect(screen.getByText(/visível a toda a vila/)).toBeInTheDocument();
  });
});
