// Assistente do mural de trabalho (change work-wall-assistant).
// Módulo puro: guia do mural, declaração da ferramenta de rascunho e validação do rascunho.
// O rascunho NÃO grava nada: a gravação acontece no cliente, após confirmação explícita do membro.

export type AssistantMode = 'default' | 'work-wall'

export const DRAFT_TOOL_NAME = 'propose_activity_draft'

/** Guia do mural usado pelo modo do mural. Respostas devem se basear somente neste texto. */
export const WORK_WALL_GUIDE = `
GUIA DO MURAL DE TRABALHO (fonte oficial para explicar o mural):
- O mural mostra as tarefas (atividades) em colunas por status: Open (disponível), In Progress (em execução), Pending Validation (aguardando validação) e Completed (concluída).
- Assumir uma tarefa: um membro que não é o solicitante clica em assumir na tarefa aberta. Ela passa a "em execução" e fica vinculada a quem assumiu.
- Evidências: quem executa pode anexar evidências (opcional). A tarefa pode ser concluída mesmo sem evidências.
- Confirmação: em "aprovação do solicitante", o solicitante confirma o trabalho. Em "consenso da comunidade", membros confirmam até atingir o número necessário.
- Pagamento: ao confirmar, a recompensa em Surreais é creditada ao executor.
- Tarefa é uma atividade com recompensa; demanda é uma tarefa pedida a um beneficiário específico. Pelo assistente, só tarefas são criadas.
- Quem executa a tarefa não confirma o próprio trabalho. Em aprovação do solicitante, o próprio solicitante (ou um administrador) pode confirmar.
- O assistente NÃO assume, confirma, edita, transfere, paga ou exclui atividades. Para isso, o membro usa o mural.
- Quando a informação não constar deste guia nem nos documentos oficiais, diga que não encontrou a informação.

REGRAS PARA CRIAR TAREFAS:
- Para criar uma tarefa, colete título, descrição e recompensa positiva em Surreais.
- Quando tiver as três informações, chame a ferramenta ${DRAFT_TOOL_NAME}. Ela apenas mostra um rascunho ao membro; o membro decide se cria.
- Nunca diga que a tarefa foi criada. Diga que o rascunho está pronto para o membro revisar e confirmar.
`

/** Declarações de ferramentas por modo. O modo padrão do Oráculo não recebe a ferramenta de rascunho. */
export function functionDeclarationsFor(mode: AssistantMode) {
  const readOnly = [
    {
      name: 'get_user_balance',
      description: 'Obtém o saldo atual do usuário autenticado em Surreals (SRL).',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'get_activity_history',
      description: 'Obtém o histórico recente de atividades e contribuições do usuário.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Número máximo de atividades a retornar (padrão 5).' },
        },
      },
    },
  ]

  if (mode !== 'work-wall') return readOnly

  return [
    ...readOnly,
    {
      name: DRAFT_TOOL_NAME,
      description: 'Apresenta ao membro um rascunho de tarefa para revisão. Não cria a tarefa: o membro confirma na interface.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Título curto da tarefa.' },
          description: { type: 'string', description: 'Descrição do que precisa ser feito.' },
          rewardAmount: { type: 'number', description: 'Recompensa em Surreals (valor positivo).' },
        },
        required: ['title', 'description', 'rewardAmount'],
      },
    },
  ]
}

export interface ActivityDraft {
  title: string
  description: string
  rewardAmount: number
}

export type DraftResult = { ok: true; draft: ActivityDraft } | { ok: false; error: string }

const MAX_TITLE = 200
const MAX_DESCRIPTION = 2000

/** Valida os argumentos do rascunho antes de mostrá-lo ao membro. */
export function validateActivityDraft(args: unknown): DraftResult {
  if (!args || typeof args !== 'object') return { ok: false, error: 'Rascunho inválido.' }
  const { title, description, rewardAmount } = args as Record<string, unknown>

  const cleanTitle = typeof title === 'string' ? title.trim() : ''
  if (!cleanTitle) return { ok: false, error: 'Faltou o título da tarefa.' }
  if (cleanTitle.length > MAX_TITLE) return { ok: false, error: `O título pode ter até ${MAX_TITLE} caracteres.` }

  const cleanDescription = typeof description === 'string' ? description.trim() : ''
  if (!cleanDescription) return { ok: false, error: 'Faltou a descrição da tarefa.' }
  if (cleanDescription.length > MAX_DESCRIPTION) {
    return { ok: false, error: `A descrição pode ter até ${MAX_DESCRIPTION} caracteres.` }
  }

  const amount = typeof rewardAmount === 'number' ? rewardAmount : Number(rewardAmount)
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'A recompensa precisa ser um valor positivo.' }

  return { ok: true, draft: { title: cleanTitle, description: cleanDescription, rewardAmount: amount } }
}
