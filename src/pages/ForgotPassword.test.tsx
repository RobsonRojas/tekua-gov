import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ForgotPassword from './ForgotPassword';
import { supabase } from '../lib/supabase';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'pt-BR',
    },
  }),
}));

vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    updateLanguage: vi.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('only imports the component', () => {
    expect(ForgotPassword).toBeDefined();
  });

  it('renders the forgot password form', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText(/forgotPassword.title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/forgotPassword.email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgotPassword.submit/i })).toBeInTheDocument();
  });

  it('calls supabase.auth.resetPasswordForEmail on submit', async () => {
    const mockReset = vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null } as any);
    renderWithProviders(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/forgotPassword.email/i);
    const submitButton = screen.getByRole('button', { name: /forgotPassword.submit/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith('test@example.com', expect.objectContaining({
        redirectTo: expect.stringContaining('/reset-password'),
      }));
    });

    expect(screen.getByText(/forgotPassword.success/i)).toBeInTheDocument();
  });

  it('shows error message on failure', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ 
      data: null, 
      error: { message: 'Invalid email' } 
    } as any);
    
    renderWithProviders(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/forgotPassword.email/i);
    const submitButton = screen.getByRole('button', { name: /forgotPassword.submit/i });

    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
    });
  });
});
