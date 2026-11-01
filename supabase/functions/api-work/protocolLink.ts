/**
 * Valida o vínculo de protocolo (change add-governance-protocols).
 * `undefined` = não informado; vazio/null remove; manter o protocolo atual é sempre
 * permitido (mesmo arquivado); um novo vínculo exige protocolo existente e ativo.
 * Módulo puro (sem Deno/Supabase) para ser testado com Vitest.
 */
export const PROTOCOL_LINK_ERROR = 'Protocol not found or archived'

export async function resolveProtocolId(client: any, protocolId: unknown, currentId?: string | null): Promise<string | null | undefined> {
  if (protocolId === undefined) return undefined
  if (protocolId === null || protocolId === '') return null
  if (typeof protocolId !== 'string') throw new Error(PROTOCOL_LINK_ERROR)
  if (protocolId === currentId) return protocolId
  const { data, error } = await client
    .from('governance_protocols')
    .select('id, status')
    .eq('id', protocolId)
    .maybeSingle()
  if (error || !data || data.status !== 'active') throw new Error(PROTOCOL_LINK_ERROR)
  return protocolId
}
