import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SharingItemDetail from './SharingItemDetail';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../lib/supabase';
import { apiClient } from '../../lib/api';

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key,
    i18n: { language: 'pt' },
  }),
}));

vi.mock('lucide-react', () => {
  const React = require('react');
  const IconMock = (name: string) => (props: any) => React.createElement('div', { 
    'data-testid': `icon-${name.toLowerCase()}`, 
    ...props 
  });

  return {
    ArrowLeft: IconMock('ArrowLeft'),
    Share2: IconMock('Share2'),
    ShieldAlert: IconMock('ShieldAlert'),
    MessageCircle: IconMock('MessageCircle'),
    CheckCircle2: IconMock('CheckCircle2'),
    Camera: IconMock('Camera'),
    Calendar: IconMock('Calendar'),
    DollarSign: IconMock('DollarSign'),
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useParams: () => ({ itemId: 'test-item-123' }),
    useNavigate: () => mockNavigate,
  };
});

describe('SharingItemDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSetup = (profileState: any = null, hasActiveTx = false) => {
    vi.mocked(useAuth).mockReturnValue({ acceptTerms: vi.fn(),
      profile: profileState,
      loading: false,
    } as any);

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'equipment_items') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { 
              id: 'test-item-123', 
              owner_id: 'owner-user-id',
              title: 'Furadeira de Impacto Bosch', 
              description: 'Ex: Acompanha brocas de diversos tamanhos.', 
              hourly_rate_surreias: 5,
              is_public: true,
              status: 'active',
              owner: { full_name: 'Carlos Oliveira', avatar_url: '' }
            }, 
            error: null 
          }),
        } as any;
      }
      if (table === 'equipment_questions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        } as any;
      }
      if (table === 'sharing_transactions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ 
            data: hasActiveTx ? [{
              id: 'tx-123',
              item_id: 'test-item-123',
              borrower_id: 'test-user-id',
              status: 'pending',
              started_at: new Date().toISOString()
            }] : [], 
            error: null 
          }),
        } as any;
      }
      if (table === 'equipment_moderation_logs') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        } as any;
      }
      return {} as any;
    });
  };

  it('renders public item details successfully for anonymous guest', async () => {
    mockSetup(null, false); // Guest (profile is null)

    render(
      <MemoryRouter>
        <SharingItemDetail />
      </MemoryRouter>
    );

    // Wait for item info to load
    await waitFor(() => {
      expect(screen.getByText('Furadeira de Impacto Bosch')).toBeInTheDocument();
    });

    // Check price and owner display
    expect(screen.getByText('5 $S')).toBeInTheDocument();
    expect(screen.getByText('Carlos Oliveira')).toBeInTheDocument();

    // Verify Guest CTA elements are rendered
    expect(screen.getByText('sharing.loginToAsk')).toBeInTheDocument();
    expect(screen.getByText('sharing.loginToRent')).toBeInTheDocument();

    // Verify Ask Question text field is NOT rendered as an input for guests
    expect(screen.queryByTestId('ask-question-input')).not.toBeInTheDocument();
  });

  it('allows authenticated members to rent and ask questions', async () => {
    mockSetup({ id: 'test-user-id', roles: ['member'], full_name: 'Joao Silva' }, false);

    render(
      <MemoryRouter>
        <SharingItemDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Furadeira de Impacto Bosch')).toBeInTheDocument();
    });

    // Verify that the standard Q&A input and Rent button are rendered
    expect(screen.getByPlaceholderText('sharing.askQuestion')).toBeInTheDocument();
    
    const rentBtn = screen.getByRole('button', { name: 'sharing.rent' });
    expect(rentBtn).toBeInTheDocument();

    // Mock API response for rent request
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: { id: 'tx-123' }, error: null });

    // Request rental
    fireEvent.click(rentBtn);

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-sharing', 'startHandover', {
        itemId: 'test-item-123'
      });
    });
  });

  it('displays active handover flow and photo evidence form for borrower', async () => {
    mockSetup({ id: 'test-user-id', roles: ['member'], full_name: 'Joao Silva' }, true);

    render(
      <MemoryRouter>
        <SharingItemDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('sharing.statusPending')).toBeInTheDocument();
    });

    // Check borrower can submit evidence
    expect(screen.getAllByText('sharing.deliveryEvidence')[0]).toBeInTheDocument();
    const evidenceInput = screen.getByPlaceholderText('https://example.com/foto.jpg');
    expect(evidenceInput).toBeInTheDocument();

    fireEvent.change(evidenceInput, { target: { value: 'https://example.com/my-drill-photo.jpg' } });

    const submitEvidenceBtn = screen.getAllByText('sharing.deliveryEvidence')[1];
    expect(submitEvidenceBtn).not.toBeDisabled();

    // Mock API
    vi.mocked(apiClient.invoke).mockResolvedValue({ data: {}, error: null });
    fireEvent.click(submitEvidenceBtn);

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-sharing', 'registerEvidence', {
        transactionId: 'tx-123',
        evidence_url: 'https://example.com/my-drill-photo.jpg'
      });
    });
  });

  it('redirects guest to login when clicking on Rent login CTA', async () => {
    mockSetup(null, false);

    render(
      <MemoryRouter>
        <SharingItemDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Furadeira de Impacto Bosch')).toBeInTheDocument();
    });

    const loginToRentBtn = screen.getByText('sharing.loginToRentBtn');
    fireEvent.click(loginToRentBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { from: '/sharing/test-item-123' }
    });
  });
});
