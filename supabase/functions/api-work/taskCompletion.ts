/**
 * Task completion flow — the evidence is OPTIONAL.
 *
 * The Portal Tekuá works on a mutual-trust principle: the honest declaration of the
 * executor, combined with the later validation by the peers (or by the requester), is
 * enough. The material evidence is an optional complement, never a gate.
 *
 * This module holds the rules of the flow and the writes it performs. It is
 * deliberately free of Deno/Supabase imports so that:
 *   - the `api-work` edge function can import it (`./taskCompletion.ts`);
 *   - it can be unit-tested with Vitest (see `src/lib/apiWorkCompletion.test.ts`).
 */

export const TASK_SOURCE_STATUS = 'in_progress'
export const TASK_TARGET_STATUS = 'pending_validation'

export const TASK_FLOW_ERRORS = {
  activityNotFound: 'activity_not_found',
  notAllowedToComplete: 'not_allowed_to_complete',
  notAllowedToAttachEvidence: 'not_allowed_to_attach_evidence',
  invalidStateToComplete: 'invalid_state_to_complete',
} as const

export const TASK_FLOW_MESSAGES = {
  activityNotFound: 'Activity not found',
  notAllowedToComplete: 'Only the executor of this task can complete it',
  notAllowedToAttachEvidence:
    'Only the executor, the requester or an admin can attach evidence to this task',
  invalidStateToComplete: 'This task is not in progress anymore',
} as const

export interface ActivitySnapshot {
  id?: string
  status: string
  requester_id?: string | null
  worker_id?: string | null
  executor_ids?: string[] | null
}

export interface AttachmentInput {
  file_url: string
  file_name?: string | null
  file_type?: string | null
  file_size?: number | null
}

export interface EvidenceInput {
  evidenceUrl?: string | null
  location?: unknown
  attachments?: AttachmentInput[]
}

export interface ActorContext {
  userId: string
  isAdmin: boolean
}

/**
 * Minimal structural type of the Supabase client used by the flows below.
 * The edge function passes the real client; the unit tests pass a double.
 */
export interface QueryClient {
  from(table: string): any
}

export class TaskFlowError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'TaskFlowError'
    this.code = code
  }
}

/** The member is the one who took the task (`worker_id`) or one of its executors. */
export function isExecutorOf(activity: ActivitySnapshot, userId: string): boolean {
  if (!userId) return false
  if (activity.worker_id && activity.worker_id === userId) return true
  const executors = activity.executor_ids
  return Array.isArray(executors) && executors.includes(userId)
}

/** Only the executor of the task (or an admin) may complete it. */
export function canCompleteTask(activity: ActivitySnapshot, actor: ActorContext): boolean {
  return actor.isAdmin || isExecutorOf(activity, actor.userId)
}

/** The evidence may also be attached by the requester of the task (or by an admin). */
export function canAttachEvidence(activity: ActivitySnapshot, actor: ActorContext): boolean {
  if (actor.isAdmin) return true
  if (isExecutorOf(activity, actor.userId)) return true
  return !!activity.requester_id && activity.requester_id === actor.userId
}

async function fetchActivity(
  client: QueryClient,
  activityId: string
): Promise<ActivitySnapshot | null> {
  const { data, error } = await client
    .from('activities')
    .select('id, status, requester_id, worker_id, executor_ids')
    .eq('id', activityId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    status: data.status,
    requester_id: data.requester_id ?? null,
    worker_id: data.worker_id ?? null,
    executor_ids: data.executor_ids ?? null,
  }
}

/**
 * Writes the optional evidence of the activity.
 *
 * The legacy `activity_evidence` row is created ONLY when there is really something
 * to record — an empty URL is treated as "no evidence" (that is what the clients used
 * to send when the member attached nothing). The attachments are always stored with
 * `is_evidence = true`.
 */
export async function recordEvidence(
  client: QueryClient,
  userId: string,
  activityId: string,
  input: EvidenceInput
): Promise<void> {
  const evidenceUrl = typeof input.evidenceUrl === 'string' ? input.evidenceUrl.trim() : ''

  if (evidenceUrl !== '') {
    const { error } = await client.from('activity_evidence').insert({
      activity_id: activityId,
      worker_id: userId,
      evidence_url: evidenceUrl,
      location: input.location ?? null,
    })

    if (error) throw error
  }

  const attachments = Array.isArray(input.attachments)
    ? input.attachments.filter((att) => att && typeof att.file_url === 'string' && att.file_url !== '')
    : []

  if (attachments.length > 0) {
    const { error } = await client
      .from('activity_attachments')
      .insert(
        attachments.map((att) => ({
          activity_id: activityId,
          user_id: userId,
          file_url: att.file_url,
          file_name: att.file_name ?? null,
          file_type: att.file_type ?? null,
          file_size: att.file_size ?? null,
          is_evidence: true,
        }))
      )

    if (error) throw error
  }
}

/**
 * Completes a task: moves it from `in_progress` to `pending_validation`.
 *
 * The evidence is optional — a task is completed even when the member attaches
 * nothing. The status is guarded by `.eq('status', 'in_progress')` so a task can
 * never be completed twice.
 */
export async function completeTask(
  client: QueryClient,
  actor: ActorContext,
  params: { activityId: string } & EvidenceInput
): Promise<{ success: true; activityId: string; status: string }> {
  const activity = await fetchActivity(client, params.activityId)

  if (!activity) {
    throw new TaskFlowError(TASK_FLOW_ERRORS.activityNotFound, TASK_FLOW_MESSAGES.activityNotFound)
  }

  if (!canCompleteTask(activity, actor)) {
    throw new TaskFlowError(
      TASK_FLOW_ERRORS.notAllowedToComplete,
      TASK_FLOW_MESSAGES.notAllowedToComplete
    )
  }

  if (activity.status !== TASK_SOURCE_STATUS) {
    throw new TaskFlowError(
      TASK_FLOW_ERRORS.invalidStateToComplete,
      TASK_FLOW_MESSAGES.invalidStateToComplete
    )
  }

  await recordEvidence(client, actor.userId, activity.id as string, params)

  const { data, error } = await client
    .from('activities')
    .update({ status: TASK_TARGET_STATUS, updated_at: new Date().toISOString() })
    .eq('id', activity.id)
    .eq('status', TASK_SOURCE_STATUS)
    .select('id, status')

  if (error) throw error

  if (!data || data.length === 0) {
    throw new TaskFlowError(
      TASK_FLOW_ERRORS.invalidStateToComplete,
      TASK_FLOW_MESSAGES.invalidStateToComplete
    )
  }

  return { success: true, activityId: activity.id as string, status: TASK_TARGET_STATUS }
}

/**
 * Attaches evidence to an activity WITHOUT changing its status.
 *
 * It is released to the executor, to the requester and to the admins, and it works
 * both before and after the completion of the task.
 */
export async function addEvidence(
  client: QueryClient,
  actor: ActorContext,
  params: { activityId: string } & EvidenceInput
): Promise<{ success: true; activityId: string }> {
  const activity = await fetchActivity(client, params.activityId)

  if (!activity) {
    throw new TaskFlowError(TASK_FLOW_ERRORS.activityNotFound, TASK_FLOW_MESSAGES.activityNotFound)
  }

  if (!canAttachEvidence(activity, actor)) {
    throw new TaskFlowError(
      TASK_FLOW_ERRORS.notAllowedToAttachEvidence,
      TASK_FLOW_MESSAGES.notAllowedToAttachEvidence
    )
  }

  await recordEvidence(client, actor.userId, activity.id as string, params)

  return { success: true, activityId: activity.id as string }
}
