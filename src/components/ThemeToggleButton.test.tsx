import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggleButton from './ThemeToggleButton';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/useAuth';

vi.mock('../context/ThemeContext', () => ({
  useThemeContext: vi.fn(),
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with light mode', () => {
    vi.mocked(useThemeContext).mockReturnValue({
      mode: 'light',
      toggleTheme: vi.fn(),
      setThemeMode: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      updateTheme: vi.fn(),
    } as any);

    render(<ThemeToggleButton />);
    // When mode is light, the icon shown should be DarkMode (to switch to dark)
    // Testing specific icons can be tricky, so we test the tooltip text
    expect(screen.getByLabelText('theme.switchToDark')).toBeInTheDocument();
  });

  it('renders correctly with dark mode', () => {
    vi.mocked(useThemeContext).mockReturnValue({
      mode: 'dark',
      toggleTheme: vi.fn(),
      setThemeMode: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      updateTheme: vi.fn(),
    } as any);

    render(<ThemeToggleButton />);
    // When mode is dark, tooltip should be switchToLight
    expect(screen.getByLabelText('theme.switchToLight')).toBeInTheDocument();
  });

  it('toggles theme but does not call updateTheme if unauthenticated', async () => {
    const toggleThemeMock = vi.fn();
    const updateThemeMock = vi.fn();
    
    vi.mocked(useThemeContext).mockReturnValue({
      mode: 'dark',
      toggleTheme: toggleThemeMock,
      setThemeMode: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      updateTheme: updateThemeMock,
    } as any);

    render(<ThemeToggleButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(toggleThemeMock).toHaveBeenCalled();
    expect(updateThemeMock).not.toHaveBeenCalled();
  });

  it('toggles theme and calls updateTheme if authenticated', async () => {
    const toggleThemeMock = vi.fn();
    const updateThemeMock = vi.fn();
    
    vi.mocked(useThemeContext).mockReturnValue({
      mode: 'dark',
      toggleTheme: toggleThemeMock,
      setThemeMode: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user' },
      updateTheme: updateThemeMock,
    } as any);

    render(<ThemeToggleButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(toggleThemeMock).toHaveBeenCalled();
    // Since mode is currently 'dark', the new mode should be 'light'
    expect(updateThemeMock).toHaveBeenCalledWith('light');
  });
});
