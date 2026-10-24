import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import SubmitTaskProof from './SubmitTaskProof';
import { apiClient } from '../lib/api';

vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

const theme = createTheme();

const ACTIVITY_ID = 'act-1';

describe('SubmitTaskProof — optional evidence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.invoke as any).mockImplementation((_domain: string, action: string) => {
      if (action === 'fetchActivityDetail') {
        return Promise.resolve({
          data: { id: ACTIVITY_ID, status: 'in_progress' },
          error: null,
        });
      }
      return Promise.resolve({ data: { success: true }, error: null });
    });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={[`/tasks/${ACTIVITY_ID}/submit`]}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/tasks/:id/submit" element={<SubmitTaskProof />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );

  it('completes the task without requiring any evidence', async () => {
    const { useAuth } = await import('../context/useAuth');
    (useAuth as any).mockReturnValue({ user: { id: 'worker-1' } });

    renderPage();

    const button = await screen.findByRole('button', { name: /work.completeTask/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith(
        'api-work',
        'completeTask',
        expect.objectContaining({ activityId: ACTIVITY_ID, attachments: [] })
      );
    });
  });

  it('attaches the evidence without changing the status of an already completed task', async () => {
    (apiClient.invoke as any).mockImplementation((_domain: string, action: string) => {
      if (action === 'fetchActivityDetail') {
        return Promise.resolve({
          data: { id: ACTIVITY_ID, status: 'pending_validation' },
          error: null,
        });
      }
      return Promise.resolve({ data: { success: true }, error: null });
    });

    const { useAuth } = await import('../context/useAuth');
    (useAuth as any).mockReturnValue({ user: { id: 'worker-1' } });

    renderPage();

    const button = await screen.findByRole('button', { name: /work.attachEvidence/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith(
        'api-work',
        'addEvidence',
        expect.objectContaining({ activityId: ACTIVITY_ID })
      );
    });
    expect(apiClient.invoke).not.toHaveBeenCalledWith(
      'api-work',
      'completeTask',
      expect.anything()
    );
  });

  it('shows the mutual-trust notice and labels the evidence as optional', async () => {
    const { useAuth } = await import('../context/useAuth');
    (useAuth as any).mockReturnValue({ user: { id: 'worker-1' } });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText(/work.trustNotice/).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/work.evidenceOptional/).length).toBeGreaterThan(0);
  });
});
