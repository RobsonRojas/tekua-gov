import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MemberManagement from './MemberManagement';
import { useMembers } from '../hooks/useMembers';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => (opts?.email ? `${key}:${opts.email}` : key),
  }),
}));

// The global setup only mocks a fixed icon list; provide the icons used by this page.
vi.mock('lucide-react', () => {
  const React = require('react');
  const icon = (name: string) => () => React.createElement('span', { 'data-testid': `icon-${name}` });
  return { Edit2: icon('edit2'), Search: icon('search'), KeyRound: icon('keyround') };
});

vi.mock('../hooks/useMembers', () => ({
  useMembers: vi.fn(),
}));

vi.mock('../components/admin/MemberEditModal', () => ({
  default: () => null,
}));

const members = [
  { id: 'u1', full_name: 'Ana', email: 'ana@example.com', roles: ['member'], functions: [] },
  { id: 'u2', full_name: 'Beto', email: 'beto@example.com', roles: ['member'], functions: [] },
];

const mockHook = (sendPasswordSetupEmail: ReturnType<typeof vi.fn>) => {
  vi.mocked(useMembers).mockReturnValue({
    members,
    loading: false,
    error: null,
    refreshMembers: vi.fn(),
    sendPasswordSetupEmail,
  } as any);
};

const stubConfirm = (answer: boolean) => {
  const fn = vi.fn().mockReturnValue(answer);
  vi.stubGlobal('confirm', fn);
  return fn;
};

describe('MemberManagement - password setup email button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows one send-email button per user', () => {
    mockHook(vi.fn());
    render(<MemberManagement />);

    expect(screen.getAllByRole('button', { name: 'admin.sendPasswordEmail' })).toHaveLength(2);
  });

  it('does not send when the admin cancels the confirmation', () => {
    const send = vi.fn();
    mockHook(send);
    const confirmSpy = stubConfirm(false);
    render(<MemberManagement />);

    fireEvent.click(screen.getAllByRole('button', { name: 'admin.sendPasswordEmail' })[0]);

    expect(confirmSpy).toHaveBeenCalledWith('admin.sendPasswordEmailConfirm:ana@example.com');
    expect(send).not.toHaveBeenCalled();
  });

  it('sends after confirmation, disables buttons while sending and shows success feedback', async () => {
    let resolveSend!: (v: any) => void;
    const send = vi.fn(() => new Promise((resolve) => { resolveSend = resolve; }));
    mockHook(send);
    stubConfirm(true);
    render(<MemberManagement />);

    fireEvent.click(screen.getAllByRole('button', { name: 'admin.sendPasswordEmail' })[0]);

    expect(send).toHaveBeenCalledWith('u1');
    await waitFor(() => {
      screen.getAllByRole('button', { name: 'admin.sendPasswordEmail' }).forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });

    // A second click while sending must not trigger another request
    fireEvent.click(screen.getAllByRole('button', { name: 'admin.sendPasswordEmail' })[1]);
    expect(send).toHaveBeenCalledTimes(1);

    resolveSend({ success: true, emailStatus: 'sent' });

    expect(await screen.findByText('admin.sendPasswordEmailSent:ana@example.com')).toBeInTheDocument();
    screen.getAllByRole('button', { name: 'admin.sendPasswordEmail' }).forEach((btn) => {
      expect(btn).toBeEnabled();
    });
  });

  it('shows the pending message when the email was queued', async () => {
    const send = vi.fn().mockResolvedValue({ success: true, emailStatus: 'queued' });
    mockHook(send);
    stubConfirm(true);
    render(<MemberManagement />);

    fireEvent.click(screen.getAllByRole('button', { name: 'admin.sendPasswordEmail' })[1]);

    expect(await screen.findByText('admin.sendPasswordEmailQueued')).toBeInTheDocument();
    expect(send).toHaveBeenCalledWith('u2');
  });

  it('shows the error returned by the API', async () => {
    const send = vi.fn().mockResolvedValue({ success: false, error: 'SITE_URL not configured' });
    mockHook(send);
    stubConfirm(true);
    render(<MemberManagement />);

    fireEvent.click(screen.getAllByRole('button', { name: 'admin.sendPasswordEmail' })[0]);

    expect(await screen.findByText('SITE_URL not configured')).toBeInTheDocument();
  });
});
