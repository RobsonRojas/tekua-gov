import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GiftsArea from './GiftsArea';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';

vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt' },
  }),
}));

const openCreateDialog = () => {
  fireEvent.click(screen.getByRole('button', { name: 'gifts.create' }));
};

const publishButton = () => screen.getByRole('button', { name: 'common.publish' });

describe('GiftsArea — cadastro de dádiva', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: 'user-2' } });
  });

  it('accepts a gift without a link', async () => {
    (apiClient.invoke as any).mockResolvedValue({ data: [], error: null });
    render(<GiftsArea />);
    await waitFor(() => expect(apiClient.invoke).toHaveBeenCalled());

    openCreateDialog();
    fireEvent.change(screen.getByRole('textbox', { name: 'common.title' }), { target: { value: 'Sementes' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'common.description' }), { target: { value: 'Doação de sementes' } });

    expect(publishButton()).toBeEnabled();
  });

  it('blocks publication and shows an error for an invalid link', async () => {
    (apiClient.invoke as any).mockResolvedValue({ data: [], error: null });
    render(<GiftsArea />);
    await waitFor(() => expect(apiClient.invoke).toHaveBeenCalled());

    openCreateDialog();
    fireEvent.change(screen.getByRole('textbox', { name: 'common.title' }), { target: { value: 'Sementes' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'common.description' }), { target: { value: 'Doação de sementes' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'gifts.linkLabel' }), { target: { value: 'nao-e-uma-url' } });

    expect(publishButton()).toBeDisabled();
    expect(screen.getByText('gifts.linkInvalid')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'gifts.linkLabel' }), { target: { value: 'https://example.com/acesso' } });

    expect(publishButton()).toBeEnabled();
  });

  it('sends the link and the markdown description on create', async () => {
    (apiClient.invoke as any).mockResolvedValue({ data: [], error: null });
    render(<GiftsArea />);
    await waitFor(() => expect(apiClient.invoke).toHaveBeenCalled());

    (apiClient.invoke as any).mockClear();
    (apiClient.invoke as any).mockResolvedValue({ data: {}, error: null });

    openCreateDialog();
    fireEvent.change(screen.getByRole('textbox', { name: 'common.title' }), { target: { value: 'Sementes' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'common.description' }), { target: { value: '**Doação** de sementes' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'gifts.linkLabel' }), { target: { value: 'https://example.com/acesso' } });
    fireEvent.click(publishButton());

    await waitFor(() =>
      expect(apiClient.invoke).toHaveBeenCalledWith('api-gifts', 'createGift', {
        title: 'Sementes',
        description: '**Doação** de sementes',
        linkUrl: 'https://example.com/acesso',
      })
    );
  });

  it('previews the Markdown description while typing', async () => {
    (apiClient.invoke as any).mockResolvedValue({ data: [], error: null });
    render(<GiftsArea />);
    await waitFor(() => expect(apiClient.invoke).toHaveBeenCalled());

    openCreateDialog();
    expect(screen.queryByText('gifts.markdownPreview')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'common.description' }), { target: { value: '**Doação** de sementes' } });

    expect(screen.getByText('gifts.markdownPreview')).toBeInTheDocument();
    expect(screen.getByText('Doação', { selector: 'strong' })).toBeInTheDocument();
  });

  it('renders the gift description as Markdown in the list', async () => {
    (apiClient.invoke as any).mockResolvedValue({
      data: [
        {
          id: 'gift-1',
          title: { pt: 'Ferramentas', en: 'Tools' },
          description: { pt: '**Empresto** ferramentas', en: '**I lend** tools' },
          provider_id: 'owner-1',
          link_url: 'https://example.com/acesso',
          provider: { full_name: 'Ana', avatar_url: null },
        },
      ],
      error: null,
    });
    render(<GiftsArea />);

    expect(await screen.findByText('Empresto', { selector: 'strong' })).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'gifts.openLink' });
    expect(link).toHaveAttribute('href', 'https://example.com/acesso');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
