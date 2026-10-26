// Regras puras das convocações de círculo restaurativo (sem dependências de rede),
// para que possam ser testadas isoladamente com `deno test`.

export type CircleStatus = 'open' | 'closed' | 'cancelled'

export interface CircleForClose {
  created_by: string
  status: CircleStatus
}

/** Autor ou administrador podem encerrar uma convocação, enquanto ela estiver aberta. */
export function canCloseCircle(circle: CircleForClose, userId: string, isAdmin: boolean): boolean {
  if (circle.status !== 'open') return false
  return circle.created_by === userId || isAdmin
}

/** Somente administradores cancelam convocações. */
export function canCancelCircle(isAdmin: boolean): boolean {
  return isAdmin
}

// Endereço de email (não nomes): detecção confiável, usada para impedir que contatos sejam publicados.
export const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

export function containsEmail(text: string): boolean {
  return EMAIL_PATTERN.test(text)
}

export interface NewCircleInput {
  title?: unknown
  description?: unknown
  scheduledAt?: unknown
  confirmedPreCircles?: unknown
}

export type NewCircleResult =
  | { ok: true; title: string; scheduledAt: string }
  | { ok: false; error: string }

/** Valida a criação: título, data futura e confirmação dos pré-círculos. */
export function validateNewCircle(input: NewCircleInput, now: number): NewCircleResult {
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  if (!title) return { ok: false, error: 'Missing circle title' }
  const description = typeof input.description === 'string' ? input.description : ''
  if (containsEmail(title) || containsEmail(description)) {
    return { ok: false, error: 'Remove e-mail addresses from the convocation' }
  }
  if (input.confirmedPreCircles !== true) {
    return { ok: false, error: 'Pre-circles must be confirmed before convening' }
  }
  if (!input.scheduledAt || typeof input.scheduledAt !== 'string') {
    return { ok: false, error: 'Invalid scheduled date' }
  }
  const when = new Date(input.scheduledAt)
  if (Number.isNaN(when.getTime())) return { ok: false, error: 'Invalid scheduled date' }
  if (when.getTime() <= now) return { ok: false, error: 'Scheduled date must be in the future' }
  return { ok: true, title, scheduledAt: when.toISOString() }
}
