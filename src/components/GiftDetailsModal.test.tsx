import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GiftDetailsModal from './GiftDetailsModal';
import { useAuth } from '../context/useAuth';

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

const baseGift = {
  id: 'gift-1',
  title: { pt: 'Ferramentas', en: 'Tools' },
  description: { pt: '**Empresto** ferramentas de jardim', en: '**I lend** garden tools' },
  provider_id: 'owner-1',
  provider: { full_name: 'Ana', avatar_url: null },
};

const renderModal = (gift: any) =>
  render(
    <GiftDetailsModal
      open
      onClose={vi.fn()}
      gift={gift}
      onRecordUsage={vi.fn()}
      recordingUsageId={null}
    />
  );

describe('GiftDetailsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: 'user-2' } });
  });

  it('renders the description as Markdown', () => {
    renderModal(baseGift);
    expect(screen.getByText('Empresto', { selector: 'strong' })).toBeInTheDocument();
  });

  it('opens markdown links from the description in a new tab, safely', () => {
    renderModal({
      ...baseGift,
      description: { pt: 'Veja [a lista](https://example.com/lista)', en: 'See [the list](https://example.com/list)' },
    });
    const link = screen.getByRole('link', { name: 'a lista' });
    expect(link).toHaveAttribute('href', 'https://example.com/lista');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows a button that opens the gift link in a new tab', () => {
    renderModal({ ...baseGift, link_url: 'https://example.com/acesso' });
    const link = screen.getByRole('link', { name: 'gifts.openLink' });
    expect(link).toHaveAttribute('href', 'https://example.com/acesso');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('keeps the markdown description inside a containing container', () => {
    renderModal({
      ...baseGift,
      description: { pt: 'palavra_extremamente_longa_sem_espacos_que_poderia_vazar_do_card', en: 'x' },
    });
    const paragraph = screen.getByText(/palavra_extremamente_longa/, { selector: 'p' });
    const wrapper = paragraph?.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper?.tagName).toBe('DIV');
    expect(wrapper?.textContent).toContain('palavra_extremamente_longa');
  });

  it('hides the link button when the gift has no link', () => {
    renderModal({ ...baseGift, link_url: null });
    expect(screen.queryByRole('link', { name: 'gifts.openLink' })).not.toBeInTheDocument();
  });

  it('hides the link button when the stored link uses a dangerous protocol', () => {
    renderModal({ ...baseGift, link_url: 'javascript:alert(1)' });
    expect(screen.queryByRole('link', { name: 'gifts.openLink' })).not.toBeInTheDocument();
  });
});
