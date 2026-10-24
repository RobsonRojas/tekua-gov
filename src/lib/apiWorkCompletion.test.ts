import { describe, it, expect } from 'vitest';
import {
  completeTask,
  addEvidence,
  canAttachEvidence,
  canCompleteTask,
  isExecutorOf,
  TASK_SOURCE_STATUS,
  TASK_TARGET_STATUS,
  TASK_FLOW_ERRORS,
  TASK_FLOW_MESSAGES,
  TaskFlowError,
} from '../../supabase/functions/api-work/taskCompletion';
import type { ActivitySnapshot } from '../../supabase/functions/api-work/taskCompletion';

/**
 * Tests of the completion flow of the `api-work` edge function.
 *
 * The evidence is OPTIONAL (mutual-trust principle): the task is completed even
 * when the member attaches nothing.
 */

type Row = Record<string, any>;

interface FakeState {
  activity: Row | null;
  updateRows: Row[] | null;
  updateError: { message: string } | null;
  insertError: { message: string } | null;
  evidenceInserts: Row[];
  attachmentInserts: Row[];
  updates: Array<{ table: string; payload: Row; filters: Array<[string, any]> }>;
}

function createFakeClient(state: FakeState) {
  return {
    from(table: string) {
      const filters: Array<[string, any]> = [];
      let mode: 'read' | 'update' = 'read';

      const builder: any = {
        select: (..._args: any[]) => {
          // Terminal of the `update(...).eq(...).eq(...).select(...)` chain.
          if (mode === 'update') {
            return Promise.resolve({
              data: state.updateRows ?? [],
              error: state.updateError ?? null,
            });
          }
          mode = 'read';
          return builder;
        },
        eq: (column: string, value: any) => {
          filters.push([column, value]);
          return builder;
        },
        single: async () => {
          if (table !== 'activities') return { data: null, error: null };
          if (!state.activity) return { data: null, error: { message: 'not found' } };
          return { data: state.activity, error: null };
        },
        insert: async (rows: any) => {
          if (table === 'activity_evidence') state.evidenceInserts.push(rows);
          if (table === 'activity_attachments') state.attachmentInserts.push(rows);
          return { error: state.insertError ?? null };
        },
        update: (payload: Row) => {
          mode = 'update';
          state.updates.push({ table, payload, filters });
          return builder;
        },
      };

      return builder;
    },
  };
}

function createState(activity: Row | null): FakeState {
  return {
    activity,
    updateRows: [{ id: 'act-1', status: TASK_TARGET_STATUS }],
    updateError: null,
    insertError: null,
    evidenceInserts: [],
    attachmentInserts: [],
    updates: [],
  };
}

const EXECUTOR = 'executor-1';
const OTHER = 'someone-else';

const inProgressActivity: ActivitySnapshot = {
  id: 'act-1',
  status: TASK_SOURCE_STATUS,
  requester_id: 'requester-1',
  worker_id: EXECUTOR,
  executor_ids: [EXECUTOR],
};

describe('completeTask (api-work)', () => {
  it('completes the task without any evidence', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    const result = await completeTask(client as any, { userId: EXECUTOR, isAdmin: false }, {
      activityId: 'act-1',
    });

    expect(result).toEqual({ success: true, activityId: 'act-1', status: TASK_TARGET_STATUS });
    // No evidence row is created when nothing is attached.
    expect(state.evidenceInserts).toHaveLength(0);
    expect(state.attachmentInserts).toHaveLength(0);
    // The activity moves to `pending_validation`, guarded by the source status.
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].table).toBe('activities');
    expect(state.updates[0].payload.status).toBe(TASK_TARGET_STATUS);
    expect(state.updates[0].filters).toEqual([
      ['id', 'act-1'],
      ['status', TASK_SOURCE_STATUS],
    ]);
  });

  it('records the optional evidence when it is provided', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    await completeTask(client as any, { userId: EXECUTOR, isAdmin: false }, {
      activityId: 'act-1',
      evidenceUrl: 'https://example.org/evidence.png',
      attachments: [{ file_url: 'https://example.org/a.png', file_name: 'a.png' }],
    });

    expect(state.evidenceInserts).toHaveLength(1);
    expect(state.evidenceInserts[0]).toMatchObject({
      activity_id: 'act-1',
      worker_id: EXECUTOR,
      evidence_url: 'https://example.org/evidence.png',
    });
    expect(state.attachmentInserts).toHaveLength(1);
    expect(state.attachmentInserts[0][0]).toMatchObject({
      activity_id: 'act-1',
      user_id: EXECUTOR,
      is_evidence: true,
    });
  });

  it('never creates an empty evidence row', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    await completeTask(client as any, { userId: EXECUTOR, isAdmin: false }, {
      activityId: 'act-1',
      evidenceUrl: '   ',
      attachments: [],
    });

    expect(state.evidenceInserts).toHaveLength(0);
    expect(state.attachmentInserts).toHaveLength(0);
  });

  it('refuses an unrelated member', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    await expect(
      completeTask(client as any, { userId: OTHER, isAdmin: false }, { activityId: 'act-1' })
    ).rejects.toMatchObject({
      code: TASK_FLOW_ERRORS.notAllowedToComplete,
      message: TASK_FLOW_MESSAGES.notAllowedToComplete,
    });

    // Nothing was written.
    expect(state.updates).toHaveLength(0);
    expect(state.evidenceInserts).toHaveLength(0);
  });

  it('allows an admin to complete the task', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    const result = await completeTask(client as any, { userId: OTHER, isAdmin: true }, {
      activityId: 'act-1',
    });

    expect(result.status).toBe(TASK_TARGET_STATUS);
    expect(state.updates).toHaveLength(1);
  });

  it('allows an executor listed only in executor_ids', async () => {
    const state = createState({
      ...inProgressActivity,
      worker_id: 'another-worker',
      executor_ids: ['executor-2'],
    });
    const client = createFakeClient(state);

    const result = await completeTask(client as any, { userId: 'executor-2', isAdmin: false }, {
      activityId: 'act-1',
    });

    expect(result.status).toBe(TASK_TARGET_STATUS);
  });

  it('refuses a task that is not in progress', async () => {
    const state = createState({ ...inProgressActivity, status: 'open' });
    const client = createFakeClient(state);

    await expect(
      completeTask(client as any, { userId: EXECUTOR, isAdmin: false }, { activityId: 'act-1' })
    ).rejects.toMatchObject({ code: TASK_FLOW_ERRORS.invalidStateToComplete });

    expect(state.updates).toHaveLength(0);
  });

  it('reports an unknown activity', async () => {
    const state = createState(null);
    const client = createFakeClient(state);

    await expect(
      completeTask(client as any, { userId: EXECUTOR, isAdmin: false }, { activityId: 'act-1' })
    ).rejects.toMatchObject({ code: TASK_FLOW_ERRORS.activityNotFound });
  });

  it('refuses when the guarded update matches no row (already completed)', async () => {
    const state = createState(inProgressActivity);
    state.updateRows = [];
    const client = createFakeClient(state);

    await expect(
      completeTask(client as any, { userId: EXECUTOR, isAdmin: false }, { activityId: 'act-1' })
    ).rejects.toMatchObject({ code: TASK_FLOW_ERRORS.invalidStateToComplete });
  });
});

describe('addEvidence (api-work)', () => {
  it('records the evidence without changing the status', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    const result = await addEvidence(client as any, { userId: EXECUTOR, isAdmin: false }, {
      activityId: 'act-1',
      evidenceUrl: 'https://example.org/evidence.png',
      attachments: [{ file_url: 'https://example.org/a.png' }],
    });

    expect(result).toEqual({ success: true, activityId: 'act-1' });
    expect(state.evidenceInserts).toHaveLength(1);
    expect(state.attachmentInserts).toHaveLength(1);
    // The status of the activity is NOT touched.
    expect(state.updates).toHaveLength(0);
  });

  it('works on an activity that is already completed', async () => {
    const state = createState({ ...inProgressActivity, status: 'pending_validation' });
    const client = createFakeClient(state);

    const result = await addEvidence(client as any, { userId: EXECUTOR, isAdmin: false }, {
      activityId: 'act-1',
      attachments: [{ file_url: 'https://example.org/a.png' }],
    });

    expect(result.success).toBe(true);
    expect(state.updates).toHaveLength(0);
    expect(state.attachmentInserts).toHaveLength(1);
  });

  it('allows the requester of the task', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    const result = await addEvidence(client as any, { userId: 'requester-1', isAdmin: false }, {
      activityId: 'act-1',
      attachments: [{ file_url: 'https://example.org/a.png' }],
    });

    expect(result.success).toBe(true);
  });

  it('allows an admin', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    const result = await addEvidence(client as any, { userId: OTHER, isAdmin: true }, {
      activityId: 'act-1',
      attachments: [{ file_url: 'https://example.org/a.png' }],
    });

    expect(result.success).toBe(true);
  });

  it('refuses an unrelated member', async () => {
    const state = createState(inProgressActivity);
    const client = createFakeClient(state);

    await expect(
      addEvidence(client as any, { userId: OTHER, isAdmin: false }, { activityId: 'act-1' })
    ).rejects.toMatchObject({ code: TASK_FLOW_ERRORS.notAllowedToAttachEvidence });

    expect(state.evidenceInserts).toHaveLength(0);
    expect(state.attachmentInserts).toHaveLength(0);
  });
});

describe('authorization helpers', () => {
  it('recognizes the executor by worker_id or executor_ids', () => {
    expect(isExecutorOf(inProgressActivity, EXECUTOR)).toBe(true);
    expect(isExecutorOf({ ...inProgressActivity, worker_id: null, executor_ids: ['x'] }, 'x')).toBe(true);
    expect(isExecutorOf(inProgressActivity, OTHER)).toBe(false);
  });

  it('only lets the executor or an admin complete a task', () => {
    expect(canCompleteTask(inProgressActivity, { userId: EXECUTOR, isAdmin: false })).toBe(true);
    expect(canCompleteTask(inProgressActivity, { userId: OTHER, isAdmin: true })).toBe(true);
    expect(canCompleteTask(inProgressActivity, { userId: OTHER, isAdmin: false })).toBe(false);
  });

  it('also lets the requester attach evidence', () => {
    expect(canAttachEvidence(inProgressActivity, { userId: 'requester-1', isAdmin: false })).toBe(true);
    expect(canAttachEvidence(inProgressActivity, { userId: OTHER, isAdmin: false })).toBe(false);
  });
});

describe('TaskFlowError', () => {
  it('is an Error carrying the machine-readable code', () => {
    const error = new TaskFlowError('some_code', 'some message');
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('some_code');
    expect(error.message).toBe('some message');
  });
});
