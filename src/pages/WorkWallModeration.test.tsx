import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WorkWall from './WorkWall';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { BrowserRouter } from 'react-router-dom';

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
    i18n: { language: 'pt' }
  }),
}));

const baseActivity = {
  description: { pt: 'Descrição', en: 'Description' },
  reward_amount: 10,
  requester_id: 'user-2',
  requester: { full_name: 'Membro' },
  worker_id: null,
  executor_ids: [],
  validation_method: 'community_consensus',
  confirmations: [{ count: 0 }],
  min_confirmations: 3,
  user_has_confirmed: false,
  attachments: [],
  urgency: false,
  importance: false,
};

const openTask = {
  ...baseActivity,
  id: 'task-1',
  title: { pt: 'Tarefa Aberta', en: 'Open Task' },
  type: 'task',
  status: 'open',
};

// Demands are persisted as activities of type 'task' (see CreateDemand).
const openDemand = {
  ...baseActivity,
  id: 'demand-1',
  title: { pt: 'Demanda Aberta', en: 'Open Demand' },
  type: 'task',
  status: 'open',
};

const contribution = {
  ...baseActivity,
  id: 'contribution-1',
  title: { pt: 'Contribuição', en: 'Contribution' },
  type: 'contribution',
  status: 'pending_validation',
  executor_ids: ['user-1'],
  worker_id: 'user-1',
};

const renderWorkWall = () => render(
  <BrowserRouter>
    <WorkWall />
  </BrowserRouter>
);

const withActivities = (activities: any[]) =>
  (apiClient.invoke as any).mockResolvedValue({ data: activities, error: null });

describe('WorkWall board columns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: 'user-1' }, profile: { roles: ['member'] } });
    withActivities([]);
  });

  it.each([
    ['admin', { roles: ['admin'] }],
    ['transversal_council', { roles: ['transversal_council'] }],
    ['member', { roles: ['member'] }],
  ])('does not render the Moderation column for %s users', async (_label, profile) => {
    (useAuth as any).mockReturnValue({ user: { id: 'user-1' }, profile });

    const { container } = renderWorkWall();

    await waitFor(() => {
      expect(container.querySelector('#kanban-col-open')).not.toBeNull();
    });

    expect(container.querySelector('#kanban-col-moderation')).toBeNull();
    expect(screen.queryByText('work.moderation')).toBeNull();
  });

  it('renders the remaining Open/In Progress/For Validating/Completed columns', async () => {
    const { container } = renderWorkWall();

    await waitFor(() => {
      expect(container.querySelector('#kanban-col-open')).not.toBeNull();
    });

    expect(container.querySelector('#kanban-col-open')).not.toBeNull();
    expect(container.querySelector('#kanban-col-in_progress')).not.toBeNull();
    expect(container.querySelector('#kanban-col-pending_validation')).not.toBeNull();
    expect(container.querySelector('#kanban-col-completed')).not.toBeNull();
  });

  it('places newly created tasks and demands directly in the Open column', async () => {
    withActivities([openTask, openDemand]);

    const { container } = renderWorkWall();

    const openColumn = () => container.querySelector('#kanban-col-open') as HTMLElement | null;

    await waitFor(() => expect(openColumn()).not.toBeNull());
    await waitFor(() => {
      expect(openColumn()?.textContent).toContain('Tarefa Aberta');
      expect(openColumn()?.textContent).toContain('Demanda Aberta');
    });

    // They are not stuck in any other column.
    const validatingText = container.querySelector('#kanban-col-pending_validation')?.textContent || '';
    expect(validatingText).not.toContain('Tarefa Aberta');
    expect(validatingText).not.toContain('Demanda Aberta');
  });

  it('places registered contributions in the For Validating column, not Open', async () => {
    withActivities([contribution]);

    const { container } = renderWorkWall();

    const validatingColumn = () => container.querySelector('#kanban-col-pending_validation') as HTMLElement | null;

    await waitFor(() => expect(validatingColumn()).not.toBeNull());
    await waitFor(() => {
      expect(validatingColumn()?.textContent).toContain('Contribuição');
    });

    const openText = container.querySelector('#kanban-col-open')?.textContent || '';
    expect(openText).not.toContain('Contribuição');
  });
});
