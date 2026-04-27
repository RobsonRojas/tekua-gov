import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './Home';
import { useAuth } from '../context/useAuth';
import { BrowserRouter } from 'react-router-dom';

// Mock useAuth
vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

describe('Home Page (Dashboard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders common cards for all users', () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { role: 'member' },
    } as any);

    renderHome();

    expect(screen.getByText(/home.cardGovTitle/i)).toBeInTheDocument();
    expect(screen.getByText(/work.mural/i)).toBeInTheDocument();
    expect(screen.getByText(/home.cardDocTitle/i)).toBeInTheDocument();
  });

  it('hides member management card for regular members', () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { role: 'member' },
    } as any);

    renderHome();

    // Member management card title should NOT be present
    expect(screen.queryByText(/home.cardMembrosTitle/i)).not.toBeInTheDocument();
  });

  it('shows member management card for admin users', () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { role: 'admin' },
    } as any);

    renderHome();

    // Member management card title SHOULD be present
    expect(screen.getByText(/home.cardMembrosTitle/i)).toBeInTheDocument();
  });
});
