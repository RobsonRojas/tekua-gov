import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterWork from './RegisterWork';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { apiClient } from '../lib/api';

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

// Mock the API client used by the page
vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
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
    i18n: { language: 'pt' },
  }),
}));

// Mock activityLogger
vi.mock('../utils/activityLogger', () => ({
  logActivity: vi.fn(),
}));

const theme = createTheme();

describe('RegisterWork', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.invoke as any).mockResolvedValue({ data: null, error: null });
  });

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
    expect(screen.getByLabelText(/work.suggested/i)).toBeInTheDocument();
  });

  it('labels the evidence as optional and shows the trust notice', () => {
    renderPage();
    expect(screen.getAllByText(/work.evidenceOptional/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/work.evidenceOptionalHint/).length).toBeGreaterThan(0);
  });

  it('validates required fields', async () => {
    renderPage();
    const submitButton = screen.getByRole('button', { name: /work.registerSubmit/i });
    fireEvent.click(submitButton);

    // The description and the amount are still required.
    await waitFor(() => {
      expect(apiClient.invoke).not.toHaveBeenCalledWith(
        'api-work',
        'submitActivity',
        expect.anything()
      );
    });
  });

  it('submits a contribution without any evidence', async () => {
    const { container } = renderPage();

    const description = screen.getByLabelText(/work.description/i);
    fireEvent.change(description, { target: { value: 'Reforço na horta da vila' } });

    const amount = screen.getByLabelText(/work.suggested/i);
    fireEvent.change(amount, { target: { value: '50' } });

    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith(
        'api-work',
        'submitActivity',
        expect.objectContaining({ evidenceUrl: '' })
      );
    });

    const call = (apiClient.invoke as any).mock.calls.find(
      ([, action]: [string, string]) => action === 'submitActivity'
    );
    // No evidence and no attachment is sent.
    expect(call[2].evidenceUrl).toBe('');
    expect(call[2].attachments).toEqual([]);
  });
});
