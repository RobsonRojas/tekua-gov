import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PushNotificationBanner from './PushNotificationBanner';
import { usePushNotifications } from '../hooks/usePushNotifications';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key,
  }),
}));

vi.mock('../hooks/usePushNotifications', () => ({
  usePushNotifications: vi.fn(),
}));

describe('PushNotificationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing if permission is granted', () => {
    vi.mocked(usePushNotifications).mockReturnValue({
      permission: 'granted',
      subscribeUser: vi.fn(),
      isSubscribing: false,
      error: null,
    } as any);

    const { container } = render(<PushNotificationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing if permission is denied', () => {
    vi.mocked(usePushNotifications).mockReturnValue({
      permission: 'denied',
      subscribeUser: vi.fn(),
      isSubscribing: false,
      error: null,
    } as any);

    const { container } = render(<PushNotificationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders banner if permission is default', () => {
    vi.mocked(usePushNotifications).mockReturnValue({
      permission: 'default',
      subscribeUser: vi.fn(),
      isSubscribing: false,
      error: null,
    } as any);

    render(<PushNotificationBanner />);
    expect(screen.getByText('Fique Atualizado!')).toBeInTheDocument();
    expect(screen.getByText('Ativar Notificações')).toBeInTheDocument();
  });

  it('calls subscribeUser on button click', () => {
    const subscribeUserMock = vi.fn();
    vi.mocked(usePushNotifications).mockReturnValue({
      permission: 'default',
      subscribeUser: subscribeUserMock,
      isSubscribing: false,
      error: null,
    } as any);

    render(<PushNotificationBanner />);
    const btn = screen.getByText('Ativar Notificações');
    fireEvent.click(btn);
    expect(subscribeUserMock).toHaveBeenCalled();
  });

  it('shows error if subscription fails', () => {
    vi.mocked(usePushNotifications).mockReturnValue({
      permission: 'default',
      subscribeUser: vi.fn(),
      isSubscribing: false,
      error: 'Test error message',
    } as any);

    render(<PushNotificationBanner />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
});
