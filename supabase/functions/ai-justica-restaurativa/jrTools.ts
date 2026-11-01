// Ferramentas do Agente de Justiça Restaurativa (change ai-convocacao-camara-restaurativa).
// Módulo puro: declaração da ferramenta de rascunho e validação do rascunho.
// O rascunho NÃO grava nada: a criação acontece no cliente, após confirmação explícita do usuário.

export const JR_TOOL_NAME = 'propose_circle_convocation'

export const jrFunctionDeclarations = [
  {
    name: JR_TOOL_NAME,
    description:
      'Apresenta ao usuário um rascunho de convocação da Câmara de Justiça Restaurativa para revisão. ' +
      'Não cria a convocação: o usuário confirma ou cancela na interface. ' +
      'Chame somente após o usuário confirmar os pré-círculos e informar tema e data/hora futura.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Tema do círculo. Não inclua nomes de pessoas nem e-mails.' },
        scheduledAt: { type: 'string', description: 'Data e hora futura do círculo, em ISO 8601 (ex.: 2026-11-20T19:00:00-03:00).' },
        description: { type: 'string', description: 'Descrição opcional do contexto coletivo, sem identificar as partes.' },
        locationOrLink: { type: 'string', description: 'Local ou link da reunião (opcional).' },
      },
      required: ['title', 'scheduledAt'],
    },
  },
]

export interface CircleConvocationDraft {
  title: string
  scheduledAt: string
  description?: string
  locationOrLink?: string
}

export type JrToolResult = { ok: true; draft: CircleConvocationDraft } | { ok: false; error: string }

const MAX_TITLE = 200
const MAX_DESCRIPTION = 2000
const MAX_LOCATION = 300
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

function optionalText(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const clean = value.trim()
  return clean ? clean.slice(0, max) : undefined
}

/** Executa a ferramenta: valida os argumentos e devolve o rascunho. Nunca grava no banco. */
export function executeJrTool(toolName: string, args: unknown, now: number = Date.now()): JrToolResult {
  if (toolName !== JR_TOOL_NAME) return { ok: false, error: `Ferramenta '${toolName}' não disponível.` }
  if (!args || typeof args !== 'object') return { ok: false, error: 'Rascunho inválido.' }
  const { title, scheduledAt, description, locationOrLink } = args as Record<string, unknown>

  const cleanTitle = typeof title === 'string' ? title.trim() : ''
  if (!cleanTitle) return { ok: false, error: 'Faltou o tema do círculo.' }
  if (cleanTitle.length > MAX_TITLE) return { ok: false, error: `O tema pode ter até ${MAX_TITLE} caracteres.` }

  if (typeof scheduledAt !== 'string' || !scheduledAt.trim()) return { ok: false, error: 'Faltou a data e hora do círculo.' }
  const when = new Date(scheduledAt)
  if (Number.isNaN(when.getTime())) return { ok: false, error: 'Data e hora inválidas.' }
  if (when.getTime() <= now) return { ok: false, error: 'A data precisa ser futura.' }

  const cleanDescription = optionalText(description, MAX_DESCRIPTION)
  const cleanLocation = optionalText(locationOrLink, MAX_LOCATION)

  if (EMAIL_PATTERN.test(cleanTitle) || (cleanDescription && EMAIL_PATTERN.test(cleanDescription))) {
    return { ok: false, error: 'Remova endereços de e-mail da convocação.' }
  }

  const draft: CircleConvocationDraft = { title: cleanTitle, scheduledAt: when.toISOString() }
  if (cleanDescription) draft.description = cleanDescription
  if (cleanLocation) draft.locationOrLink = cleanLocation
  return { ok: true, draft }
}
