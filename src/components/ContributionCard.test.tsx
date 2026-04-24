import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContributionCard from './ContributionCard';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// Mock useAuth
vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
  }),
}));

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const theme = createTheme();

describe('ContributionCard', () => {
  const mockContribution = {
    id: 'cont-1',
    user_id: 'user-2',
    description: 'Test Work',
    amount_suggested: 10,
    status: 'pending',
    evidence_url: 'http://test.com',
    profiles: { full_name: 'Test User' },
    confirmations: [{ count: 1 }],
    user_has_confirmed: false,
  };

  const mockOnRefresh = vi.fn();

  const renderCard = (contribution = mockContribution) => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ContributionCard 
            contribution={contribution} 
            threshold={3} 
            onRefresh={mockOnRefresh} 
          />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('renders contribution details correctly', () => {
    renderCard();
    expect(screen.getByText('Test Work')).toBeInTheDocument();
    expect(screen.getByText('10 $S')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows correct progress', () => {
    renderCard();
    expect(screen.getByText('work.confirmations: 1 / 3')).toBeInTheDocument();
  });

  it('disables confirm button for owner', () => {
    const ownerContribution = { ...mockContribution, user_id: 'user-1' };
    renderCard(ownerContribution);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('disables confirm button if already confirmed', () => {
    const alreadyConfirmed = { ...mockContribution, user_has_confirmed: true };
    renderCard(alreadyConfirmed);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('work.confirmed')).toBeInTheDocument();
  });

  it('disables confirm button if completed', () => {
    const completed = { ...mockContribution, status: 'completed' };
    renderCard(completed);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('work.completed')).toBeInTheDocument();
  });
});
