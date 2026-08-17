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

vi.mock('lucide-react', () => {
  const React = require('react');
  const IconMock = (name: string) => (props: any) => React.createElement('div', { 'data-testid': `icon-${name}`, ...props });
  return {
    Wallet: IconMock('Wallet'),
    ArrowUpRight: IconMock('ArrowUpRight'),
    ArrowDownLeft: IconMock('ArrowDownLeft'),
    History: IconMock('History'),
    Send: IconMock('Send'),
    RefreshCw: IconMock('RefreshCw'),
    Info: IconMock('Info'),
    User: IconMock('User'),
    QrCode: IconMock('QrCode'),
    Scan: IconMock('Scan'),
    Share2: IconMock('Share2'),
  };
});

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

  it('copies share receipt link to clipboard and shows confirmation', async () => {
    const mockTx = {
      id: 'tx-test-1',
      from_id: 'other-user',
      to_id: 'test-user-id',
      amount: 5,
      description: 'Recompensa por trabalho',
      created_at: new Date().toISOString(),
      from_profile: { full_name: 'Remetente', email: 'remetente@example.com' },
      to_profile: { full_name: 'Destinatário', email: 'destinatario@example.com' }
    };

    vi.mocked(apiClient.invoke).mockImplementation((domain, action) => {
      if (domain === 'api-wallet' && action === 'getBalance') {
        return Promise.resolve({ data: { balance: 123, locked_balance: 0, pending_audit_balance: 0 }, error: null });
      }
      if (domain === 'api-wallet' && action === 'fetchTransactions') {
        return Promise.resolve({ data: [mockTx], error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock }
    });

    renderComponent();

    const shareButton = await screen.findByTestId(`share-receipt-${mockTx.id}`);
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(`${window.location.origin}/share/surreal/${mockTx.id}`);
      expect(screen.getByText('Link de compartilhamento copiado!')).toBeInTheDocument();
    });
  });
});
