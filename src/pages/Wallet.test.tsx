import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Wallet from './Wallet';
import { BrowserRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => {
  return {
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { balance: 123 }, error: null }),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      rpc: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
    useAuth: {
      user: { id: 'test-user-id', email: 'test@tekua.com' },
    },
    t: (key: string) => key,
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: mocks.supabase,
}));

vi.mock('../context/useAuth', () => ({
  useAuth: () => mocks.useAuth,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mocks.t,
  }),
}));

describe('Wallet Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <Wallet />
    </BrowserRouter>
  );

  it('renders balance correctly', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('123')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('opens transfer modal when clicking transfer button', async () => {
    renderComponent();
    const btn = await screen.findByTestId('transfer-button', {}, { timeout: 10000 });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText('wallet.send')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
