// Regras puras das pautas do fórum (sem dependências de rede), testáveis com `deno test`.
// Os valores devem coincidir com o CHECK de discussion_topics.status ('open' | 'closed').

export type TopicStatus = 'open' | 'closed'

export const TOPIC_STATUS_OPEN: TopicStatus = 'open'

export function acceptsVotes(status: string | null | undefined): boolean {
  return status === TOPIC_STATUS_OPEN
}

export const MAX_MENTIONS_PER_COMMENT = 20

export interface ParentComment {
  id: string
  topic_id: string
  parent_id: string | null
}

// Um único nível de resposta: se o pai já é resposta, a nova resposta vai para o comentário raiz.
export function resolveReplyParent(
  parent: ParentComment | null | undefined,
  topicId: string,
): { ok: true; parentId: string } | { ok: false; error: string } {
  if (!parent) return { ok: false, error: 'Parent comment not found' }
  if (parent.topic_id !== topicId) return { ok: false, error: 'Parent comment belongs to another topic' }
  return { ok: true, parentId: parent.parent_id ?? parent.id }
}

// Remove não-strings, duplicatas e o próprio autor, e aplica o limite.
export function sanitizeMentionIds(ids: unknown, authorId: string): string[] {
  if (!Array.isArray(ids)) return []
  const out: string[] = []
  for (const id of ids) {
    if (typeof id !== 'string' || id === authorId || out.includes(id)) continue
    out.push(id)
    if (out.length >= MAX_MENTIONS_PER_COMMENT) break
  }
  return out
}

// Quem é notificado: menções (sem autor) e, se for resposta, o autor do pai
// (exceto o próprio autor e quem já recebeu a notificação de menção).
export function notificationTargets(
  authorId: string,
  mentionedIds: string[],
  parentAuthorId: string | null | undefined,
): { mention: string[]; reply: string[] } {
  const mention = mentionedIds.filter((id) => id !== authorId)
  const reply = parentAuthorId && parentAuthorId !== authorId && !mention.includes(parentAuthorId)
    ? [parentAuthorId]
    : []
  return { mention, reply }
}
