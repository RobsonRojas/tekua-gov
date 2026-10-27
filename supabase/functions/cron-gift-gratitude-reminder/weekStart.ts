/** Início (segunda-feira, UTC) da semana corrente, em AAAA-MM-DD. Chave do controle de envio semanal. */
export function weekStartOf(now: Date): string {
  const day = now.getUTCDay() === 0 ? 7 : now.getUTCDay()
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (day - 1)))
  return monday.toISOString().slice(0, 10)
}
