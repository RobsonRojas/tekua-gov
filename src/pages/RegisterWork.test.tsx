import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterWork from './RegisterWork';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        neq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: 'new-id', error: null })),
  },
}));

// Mock useAuth
vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
  }),
}));

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock activityLogger
vi.mock('../utils/activityLogger', () => ({
  logActivity: vi.fn(),
}));

const theme = createTheme();

describe('RegisterWork', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <RegisterWork />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('renders registration form', () => {
    renderPage();
    expect(screen.getAllByText('work.register').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/work.description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work.evidence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work.suggested/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderPage();
    const submitButton = screen.getByRole('button', { name: /work.submit/i });
    fireEvent.click(submitButton);
    
    // MUI TextField uses required attribute which browser handles, 
    // but we can check if rpc was NOT called
    const { supabase } = await import('../lib/supabase');
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
