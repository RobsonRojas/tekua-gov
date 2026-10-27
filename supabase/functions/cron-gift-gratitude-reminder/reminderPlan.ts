// Decisão do lembrete semanal de agradecimento, separada do acesso ao banco para ser testável.

/** A RPC `gift_gratitude_reminder_candidates` (SETOF uuid) pode vir como lista de valores ou de objetos. */
export function candidateIdsFrom(rows: unknown[]): string[] {
  return rows
    .map((row) => (typeof row === 'string' ? row : Object.values(row as Record<string, unknown>)[0]))
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
}

export interface ReminderPlan {
  toNotify: string[]
  failed: string[]
}

/**
 * Para cada candidato, `register` grava o envio da semana e devolve true só quando a
 * gravação é nova. Quem já foi lembrado nesta semana (false) não recebe de novo; uma
 * falha em `register` é registrada em `failed` e não interrompe os demais.
 */
export async function planReminders(
  candidates: string[],
  register: (userId: string) => Promise<boolean>,
): Promise<ReminderPlan> {
  const toNotify: string[] = []
  const failed: string[] = []
  for (const userId of candidates) {
    try {
      if (await register(userId)) toNotify.push(userId)
    } catch {
      failed.push(userId)
    }
  }
  return { toNotify, failed }
}
