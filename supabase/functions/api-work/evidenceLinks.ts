/**
 * Links como evidência (change add-evidence-links).
 *
 * Um link é uma linha de `activity_attachments` com `file_type = 'link'`. O endereço
 * é exibido a outros membros, então somente `http`/`https` é aceito, validado aqui
 * no servidor e não só no formulário. Módulo puro (sem Deno/Supabase) para ser
 * testado com Vitest.
 */

export const EVIDENCE_LINK_TYPE = 'link'
export const MAX_EVIDENCE_LINK_LENGTH = 2000
export const INVALID_EVIDENCE_LINK_ERROR = 'Invalid evidence link: only http and https addresses are accepted'

export interface EvidenceAttachment {
  file_url: string
  file_name?: string | null
  file_type?: string | null
  file_size?: number | null
}

export function isValidEvidenceLink(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_EVIDENCE_LINK_LENGTH) return false
  try {
    const { protocol } = new URL(trimmed)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Valida e normaliza os anexos recebidos. Qualquer anexo `link` inválido faz a
 * chamada falhar, antes de qualquer gravação. Links ficam sem tamanho e, sem
 * rótulo, usam o próprio endereço como nome.
 */
export function normalizeEvidenceAttachments<T extends EvidenceAttachment>(input: unknown): T[] {
  if (!Array.isArray(input)) return []
  const out: T[] = []
  for (const att of input as T[]) {
    if (!att || typeof att.file_url !== 'string' || att.file_url === '') continue
    if (att.file_type === EVIDENCE_LINK_TYPE) {
      if (!isValidEvidenceLink(att.file_url)) throw new Error(INVALID_EVIDENCE_LINK_ERROR)
      const url = att.file_url.trim()
      out.push({ ...att, file_url: url, file_name: att.file_name?.trim() || url, file_size: null })
    } else {
      out.push(att)
    }
  }
  return out
}
