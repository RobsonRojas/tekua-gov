// Regras puras dos protocolos/POPs (change add-governance-protocols), sem dependências
// de rede, para serem testadas isoladamente.

export const MAX_PROTOCOL_TITLE = 200
export const MAX_PROTOCOL_CONTENT = 20000

export type ProtocolStatus = 'active' | 'archived'

/** Somente administradores e membros do Conselho Transversal escrevem protocolos. */
export function canWriteProtocols(role: unknown, roles: unknown): boolean {
  const all = new Set<string>()
  if (typeof role === 'string') all.add(role)
  if (Array.isArray(roles)) for (const r of roles) if (typeof r === 'string') all.add(r)
  return all.has('admin') || all.has('transversal_council')
}

export type ProtocolInputResult =
  | { ok: true; title: string; content: string }
  | { ok: false; error: string }

export function validateProtocolInput(input: { title?: unknown; content?: unknown }): ProtocolInputResult {
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  if (!title) return { ok: false, error: 'Missing protocol title' }
  if (title.length > MAX_PROTOCOL_TITLE) return { ok: false, error: `Protocol title must have at most ${MAX_PROTOCOL_TITLE} characters` }
  const content = typeof input.content === 'string' ? input.content : ''
  if (content.length > MAX_PROTOCOL_CONTENT) return { ok: false, error: `Protocol content must have at most ${MAX_PROTOCOL_CONTENT} characters` }
  return { ok: true, title, content }
}

export function isProtocolStatus(value: unknown): value is ProtocolStatus {
  return value === 'active' || value === 'archived'
}
