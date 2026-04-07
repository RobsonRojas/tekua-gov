import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ForgotPassword from './ForgotPassword';
import { supabase } from '../lib/supabase';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n'; // Assuming i18n is exported from src/lib/i18n.ts

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    updateLanguage: vi.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </I18nextProvider>
  );
};

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText(/Recuperar Senha|Recover Password/i)).toBeDefined();
    expect(screen.getByLabelText(/Endereço de Email|Email Address/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Enviar Link|Send Link/i })).toBeDefined();
  });

  it('calls supabase.auth.resetPasswordForEmail on submit', async () => {
    const mockReset = vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null } as any);
    renderWithProviders(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/Endereço de Email|Email Address/i);
    const submitButton = screen.getByRole('button', { name: /Enviar Link|Send Link/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith('test@example.com', expect.objectContaining({
        redirectTo: expect.stringContaining('/reset-password'),
      }));
    });

    expect(screen.getByText(/Link enviado|Link sent/i)).toBeDefined();
  });

  it('shows error message on failure', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ 
      data: null, 
      error: { message: 'Invalid email' } 
    } as any);
    
    renderWithProviders(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/Endereço de Email|Email Address/i);
    const submitButton = screen.getByRole('button', { name: /Enviar Link|Send Link/i });

    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeDefined();
    });
  });
});
