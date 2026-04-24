import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageSelector from './LanguageSelector';

const mockChangeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: mockChangeLanguage,
      language: 'pt-BR',
    },
  }),
}));

const mockUpdateLanguage = vi.fn();

vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    updateLanguage: mockUpdateLanguage,
  }),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with current language', () => {
    render(<LanguageSelector />);
    // Check if the button to open menu is rendered
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens menu and selects a new language', () => {
    render(<LanguageSelector />);
    
    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Select English
    const enOption = screen.getByText('English');
    fireEvent.click(enOption);
    
    // Verify AuthContext.updateLanguage was called
    expect(mockUpdateLanguage).toHaveBeenCalledWith('en');
  });
});
