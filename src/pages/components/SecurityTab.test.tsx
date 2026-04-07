import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SecurityTab from './SecurityTab';
import { supabase } from '../../lib/supabase';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../lib/i18n';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

const renderWithProviders = async (component: React.ReactNode) => {
  await act(async () => {
    await i18n.changeLanguage('en');
  });
  
  const result = render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
  return result;
};

describe('SecurityTab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the change password form', async () => {
    const { container } = await renderWithProviders(<SecurityTab />);
    
    expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
    expect(container.querySelector('#new-password')).toBeInTheDocument();
    expect(container.querySelector('#confirm-password')).toBeInTheDocument();
  });

  it('validates matching passwords', async () => {
    const { container } = await renderWithProviders(<SecurityTab />);

    const passwordInput = container.querySelector('#new-password') as HTMLInputElement;
    const confirmInput = container.querySelector('#confirm-password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('validates minimum password length', async () => {
    const { container } = await renderWithProviders(<SecurityTab />);

    const passwordInput = container.querySelector('#new-password') as HTMLInputElement;
    const confirmInput = container.querySelector('#confirm-password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 6 characters long/i)).toBeInTheDocument();
    });
  });

  it('calls supabase.auth.updateUser and shows success on valid submit', async () => {
    const mockUpdate = vi.mocked(supabase.auth.updateUser).mockResolvedValue({ data: {}, error: null } as any);
    const { container } = await renderWithProviders(<SecurityTab />);

    const passwordInput = container.querySelector('#new-password') as HTMLInputElement;
    const confirmInput = container.querySelector('#confirm-password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ password: 'newpassword123' });
    });

    await waitFor(() => {
      expect(screen.getByText(/Password updated successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error message if update fails', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({ 
      data: {}, 
      error: { message: 'Network error' } as any 
    } as any);
    const { container } = await renderWithProviders(<SecurityTab />);

    const passwordInput = container.querySelector('#new-password') as HTMLInputElement;
    const confirmInput = container.querySelector('#confirm-password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
