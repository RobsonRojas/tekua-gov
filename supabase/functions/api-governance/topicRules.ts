// Regras puras das pautas do fórum (sem dependências de rede), testáveis com `deno test`.
// Os valores devem coincidir com o CHECK de discussion_topics.status ('open' | 'closed').

export type TopicStatus = 'open' | 'closed'

export const TOPIC_STATUS_OPEN: TopicStatus = 'open'

export function acceptsVotes(status: string | null | undefined): boolean {
  return status === TOPIC_STATUS_OPEN
}
