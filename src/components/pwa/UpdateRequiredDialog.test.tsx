import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UpdateRequiredDialog from './UpdateRequiredDialog';
import { usePWA } from '../../context/PWAContext';

vi.mock('../../context/PWAContext', () => ({
  usePWA: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UpdateRequiredDialog', () => {
  it('renders when updateAvailable is true and cannot be dismissed', () => {
    vi.mocked(usePWA).mockReturnValue({
      updateAvailable: true,
      applyUpdate: vi.fn(),
      isInstallable: false,
      installApp: async () => {},
      isInstalled: false,
      platform: 'unknown',
      browser: 'other',
    });

    render(<UpdateRequiredDialog />);
    expect(screen.getByText('pwa.updateRequiredTitle')).toBeInTheDocument();
    expect(screen.getByText('pwa.updateRequiredDesc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'pwa.updateNow' })).toBeInTheDocument();
  });

  it('calls applyUpdate when clicking update button', () => {
    const applyUpdate = vi.fn();
    vi.mocked(usePWA).mockReturnValue({
      updateAvailable: true,
      applyUpdate,
      isInstallable: false,
      installApp: async () => {},
      isInstalled: false,
      platform: 'unknown',
      browser: 'other',
    });

    render(<UpdateRequiredDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'pwa.updateNow' }));
    expect(applyUpdate).toHaveBeenCalled();
  });

  it('stays open on Escape and backdrop click', () => {
    vi.mocked(usePWA).mockReturnValue({
      updateAvailable: true,
      applyUpdate: vi.fn(),
      isInstallable: false,
      installApp: async () => {},
      isInstalled: false,
      platform: 'unknown',
      browser: 'other',
    });

    render(<UpdateRequiredDialog />);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    const backdrop = dialog.parentElement?.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('pwa.updateRequiredTitle')).toBeInTheDocument();
  });
});
