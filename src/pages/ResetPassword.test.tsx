import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPassword from './ResetPassword';
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

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

const renderAt = (search: string) => {
  window.history.pushState({}, '', `/reset-password${search}`);
  return render(
    <BrowserRouter>
      <ResetPassword />
    </BrowserRouter>
  );
};

const fillAndSubmit = (container: HTMLElement, password: string, confirm: string, submitName: RegExp) => {
  const inputs = container.querySelectorAll('input[type="password"]');
  fireEvent.change(inputs[0], { target: { value: password } });
  fireEvent.change(inputs[1], { target: { value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: submitName }));
};

describe('ResetPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({ data: {}, error: null } as any);
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({ data: {}, error: null } as any);
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any);
  });

  it('shows the reset copy and verifies the token hash', async () => {
    const { container } = renderAt('?e=a@b.com&t=hash123');

    await waitFor(() => {
      expect(screen.getByText('forgotPassword.resetTitle')).toBeInTheDocument();
    });
    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'hash123', type: 'recovery' });
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'forgotPassword.resetSubmit' })).toBeInTheDocument();
  });

  it('shows the finish-signup copy when flow=invite', async () => {
    renderAt('?e=a@b.com&t=hash123&flow=invite');

    await waitFor(() => {
      expect(screen.getByText('forgotPassword.inviteTitle')).toBeInTheDocument();
    });
    expect(screen.getByText('forgotPassword.inviteSubtitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'forgotPassword.inviteSubmit' })).toBeInTheDocument();
    expect(screen.queryByText('forgotPassword.resetTitle')).not.toBeInTheDocument();
  });

  it('shows an error and a back-to-login button when the token params are missing', async () => {
    renderAt('');

    await waitFor(() => {
      expect(screen.getByText('forgotPassword.invalidRequest')).toBeInTheDocument();
    });
    expect(supabase.auth.verifyOtp).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'forgotPassword.backToLogin' })).toBeInTheDocument();
  });

  it('shows an error and a back-to-login button when the token is expired', async () => {
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({ data: {}, error: { message: 'expired' } } as any);
    renderAt('?e=a@b.com&t=old&flow=invite');

    await waitFor(() => {
      expect(screen.getByText('forgotPassword.invalidRequest')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'forgotPassword.backToLogin' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'forgotPassword.inviteSubmit' })).not.toBeInTheDocument();
  });

  it('validates matching passwords', async () => {
    const { container } = renderAt('?e=a@b.com&t=hash123');
    await screen.findByText('forgotPassword.resetTitle');

    fillAndSubmit(container, 'password123', 'password456', /forgotPassword.resetSubmit/);

    await waitFor(() => {
      expect(screen.getByText('forgotPassword.errorMismatch')).toBeInTheDocument();
    });
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('updates the password and signs out in the invite flow', async () => {
    const { container } = renderAt('?e=a@b.com&t=hash123&flow=invite');
    await screen.findByText('forgotPassword.inviteTitle');

    fillAndSubmit(container, 'password123', 'password123', /forgotPassword.inviteSubmit/);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'password123' });
    });
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('forgotPassword.resetSuccess')).toBeInTheDocument();
    expect(
      vi.mocked(supabase.auth.updateUser).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(supabase.auth.signOut).mock.invocationCallOrder[0]);
  });

  it('does not sign out when updating the password fails', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({ data: {}, error: { message: 'weak password' } } as any);
    const { container } = renderAt('?e=a@b.com&t=hash123');
    await screen.findByText('forgotPassword.resetTitle');

    fillAndSubmit(container, 'password123', 'password123', /forgotPassword.resetSubmit/);

    await waitFor(() => {
      expect(screen.getByText('weak password')).toBeInTheDocument();
    });
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });
});
