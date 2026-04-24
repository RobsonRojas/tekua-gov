import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Voting from './Voting';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';

// Mock dependencies
vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key,
    i18n: { language: 'pt' },
  }),
}));

vi.mock('react-quill', () => ({
  default: () => <div data-testid="react-quill-mock" />
}));

describe('Voting Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders topics correctly and hides create button for normal members', async () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { role: 'member' },
    } as any);

    const mockTopics = [
      { id: '1', title: { pt: 'Tópico 1' }, status: 'open', created_at: new Date().toISOString() },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockTopics, error: null }),
    } as any);

    render(
      <MemoryRouter>
        <Voting />
      </MemoryRouter>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Tópico 1')).toBeInTheDocument();
    expect(screen.getByText('Aberta')).toBeInTheDocument();
    
    // Normal member should not see create topic button
    expect(screen.queryByText('Criar Nova Pauta')).not.toBeInTheDocument();
  });

  it('shows create button for admin and can open dialog', async () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { role: 'admin' },
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any);

    render(
      <MemoryRouter>
        <Voting />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const createBtn = screen.getByText('Criar Nova Pauta');
    expect(createBtn).toBeInTheDocument();

    fireEvent.click(createBtn);
    expect(screen.getAllByText('Título da Pauta')[0]).toBeInTheDocument();
  });
});
