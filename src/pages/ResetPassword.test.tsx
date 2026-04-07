import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPassword from './ResetPassword';
import { supabase } from '../lib/supabase';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';
import { useAuth } from '../context/AuthContext';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const renderWithProviders = async (component: React.ReactNode) => {
  await act(async () => {
    await i18n.changeLanguage('en');
  });
  
  const result = render(
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </I18nextProvider>
  );
  return result;
};

describe('ResetPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the reset password form when session exists', async () => {
    vi.mocked(useAuth).mockReturnValue({ 
      session: { user: {} } as any, 
      loading: false,
      user: {} as any,
      profile: {},
      signOut: vi.fn(),
      updateLanguage: vi.fn(),
      updateTheme: vi.fn()
    });

    await renderWithProviders(<ResetPassword />);
    
    await waitFor(() => {
      expect(screen.getByText(/Set New Password/i)).toBeInTheDocument();
    });
    
    const inputs = document.querySelectorAll('input[type="password"]');
    expect(inputs).toHaveLength(2);
  });

  it('shows error if no session exists', async () => {
    vi.mocked(useAuth).mockReturnValue({ 
      session: null, 
      loading: false,
      user: null,
      profile: null,
      signOut: vi.fn(),
      updateLanguage: vi.fn(),
      updateTheme: vi.fn()
    });

    await renderWithProviders(<ResetPassword />);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid or expired session/i)).toBeInTheDocument();
    });
  });

  it('validates matching passwords', async () => {
    vi.mocked(useAuth).mockReturnValue({ 
      session: { user: {} } as any, 
      loading: false,
      user: {} as any,
      profile: {},
      signOut: vi.fn(),
      updateLanguage: vi.fn(),
      updateTheme: vi.fn()
    });

    const { container } = await renderWithProviders(<ResetPassword />);

    await waitFor(() => {
      expect(screen.getByText(/Set New Password/i)).toBeInTheDocument();
    });

    const inputs = container.querySelectorAll('input[type="password"]');
    const passwordInput = inputs[0];
    const confirmInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('calls supabase.auth.updateUser on valid submit', async () => {
    vi.mocked(useAuth).mockReturnValue({ 
      session: { user: {} } as any, 
      loading: false,
      user: {} as any,
      profile: {},
      signOut: vi.fn(),
      updateLanguage: vi.fn(),
      updateTheme: vi.fn()
    });
    const mockUpdate = vi.mocked(supabase.auth.updateUser).mockResolvedValue({ data: {}, error: null } as any);

    const { container } = await renderWithProviders(<ResetPassword />);

    await waitFor(() => {
      expect(screen.getByText(/Set New Password/i)).toBeInTheDocument();
    });

    const inputs = container.querySelectorAll('input[type="password"]');
    const passwordInput = inputs[0];
    const confirmInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ password: 'password123' });
    });

    expect(screen.getByText(/Password updated successfully/i)).toBeInTheDocument();
  });
});
