import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Wallet from './Wallet';
import { BrowserRouter } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';

// Mock dependencies
vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Wallet Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'test-user-id' } } as any);
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <Wallet />
    </BrowserRouter>
  );

  it('renders balance correctly', async () => {
    vi.mocked(apiClient.invoke).mockImplementation((domain, action) => {
      if (domain === 'api-wallet' && action === 'getBalance') {
        return Promise.resolve({ data: { balance: 123, locked_balance: 0, pending_audit_balance: 0 }, error: null });
      }
      return Promise.resolve({ data: [], error: null });
    });

    renderComponent();
    screen.debug();
    await waitFor(() => {
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  it('opens transfer modal when clicking transfer button', async () => {
    vi.mocked(apiClient.invoke).mockImplementation((domain, action) => {
      if (domain === 'api-wallet' && action === 'getBalance') {
        return Promise.resolve({ data: { balance: 123, locked_balance: 0, pending_audit_balance: 0 }, error: null });
      }
      if (domain === 'api-wallet' && action === 'fetchTransactions') {
        return Promise.resolve({ data: [], error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    renderComponent();
    
    // Wait for the button to appear
    const btn = await screen.findByTestId('transfer-button');
    fireEvent.click(btn);
    
    await waitFor(() => {
      expect(screen.getByText('wallet.send')).toBeInTheDocument();
    });
  });
});
