import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import WorkWall from './WorkWall';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../lib/api', () => ({
  apiClient: {
    invoke: vi.fn(),
  },
}));

vi.mock('../lib/db', () => ({
  getCachedData: vi.fn().mockResolvedValue(null),
  cacheData: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt' },
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

    // Wait for the activities to be fetched and displayed
    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-work', 'fetchActivities', expect.any(Object));
    });
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
      expect(screen.getAllByText('work.noItemsColumn').length).toBeGreaterThan(0);
    });
  });

  it('should complete the task in a single step when it is dragged to "Para Validar"', async () => {
    (apiClient.invoke as any).mockImplementation((_domain: string, action: string) => {
      if (action === 'fetchActivities') {
        return Promise.resolve({ data: mockActivities, error: null });
      }
      if (action === 'completeTask') {
        return Promise.resolve({ data: { success: true }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    render(
      <BrowserRouter>
        <WorkWall />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tarefa 2')).toBeDefined();
    });

    const column = document.getElementById('kanban-col-pending_validation');
    expect(column).toBeTruthy();

    fireEvent.drop(column as HTMLElement, {
      dataTransfer: {
        getData: () => JSON.stringify({ activityId: '2', sourceStatus: 'in_progress' }),
      },
    });

    // The task is completed directly — the member is NOT sent to the proof page.
    await waitFor(() => {
      expect(apiClient.invoke).toHaveBeenCalledWith('api-work', 'completeTask', { activityId: '2' });
    });
    expect(apiClient.invoke).not.toHaveBeenCalledWith('api-work', 'submitProof', expect.anything());
  });
});
