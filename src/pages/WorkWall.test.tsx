import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WorkWall from './WorkWall';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockActivities = [
  { id: '1', title: { pt: 'Tarefa 1', en: 'Task 1' }, status: 'open', type: 'task' },
  { id: '2', title: { pt: 'Tarefa 2', en: 'Task 2' }, status: 'in_progress', type: 'task' },
];

describe('WorkWall Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: 'user-1' } });
    (apiClient.invoke as any).mockResolvedValue({ data: mockActivities, error: null });
  });

  it('should render and display activities from the "All" tab by default', async () => {
    render(
      <BrowserRouter>
        <WorkWall />
      </BrowserRouter>
    );

    // Should call fetchActivities
    expect(apiClient.invoke).toHaveBeenCalledWith('api-work', 'fetchActivities', expect.any(Object));

    // Wait for the activities to be displayed
    await waitFor(() => {
      expect(screen.getByText('Tarefa 1')).toBeDefined();
      expect(screen.getByText('Tarefa 2')).toBeDefined();
    });
  });

  it('should handle API errors gracefully', async () => {
    (apiClient.invoke as any).mockResolvedValue({ data: null, error: 'API Error' });
    
    render(
      <BrowserRouter>
        <WorkWall />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Tarefa 1')).toBeNull();
      expect(screen.getByText('work.noItems')).toBeDefined();
    });
  });
});
