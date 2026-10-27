// Validação do agradecimento de dádiva (change gift-gratitude). Módulo puro, testável com `deno test`.

export const MAX_MESSAGE = 280
export const MAX_EMOJIS = 5
export const MAX_EMOJI_LENGTH = 16

// Um emoji (com modificadores, ZWJ e seletor de variação) — nada de letras ou HTML.
const EMOJI_PATTERN = /^[\p{Extended_Pictographic}\p{Emoji_Component}‍]+$/u

export interface GratitudeInput {
  message?: unknown
  emojis?: unknown
}

export type GratitudeResult =
  | { ok: true; message: string | null; emojis: string[] | null }
  | { ok: false; error: string }

/** Mensagem e emojis são opcionais. Vazio vira null (sem agradecimento). */
export function validateGratitude(input: GratitudeInput): GratitudeResult {
  let message: string | null = null
  if (input.message !== undefined && input.message !== null) {
    if (typeof input.message !== 'string') return { ok: false, error: 'Message must be text' }
    const trimmed = input.message.trim()
    if (trimmed.length > MAX_MESSAGE) {
      return { ok: false, error: `Message must have at most ${MAX_MESSAGE} characters` }
    }
    message = trimmed || null
  }

  let emojis: string[] | null = null
  if (input.emojis !== undefined && input.emojis !== null) {
    if (!Array.isArray(input.emojis)) return { ok: false, error: 'Emojis must be a list' }
    if (input.emojis.length > MAX_EMOJIS) return { ok: false, error: `At most ${MAX_EMOJIS} emojis` }
    for (const item of input.emojis) {
      if (typeof item !== 'string' || item.length === 0 || item.length > MAX_EMOJI_LENGTH || !EMOJI_PATTERN.test(item)) {
        return { ok: false, error: 'Only emojis are allowed' }
      }
    }
    emojis = input.emojis.length > 0 ? (input.emojis as string[]) : null
  }

  return { ok: true, message, emojis }
}

export type Sentiment = 'gratitude' | 'ingratitude'

/** Sentimento do registro: gratidão (padrão) ou ingratidão. Qualquer outro valor é recusado. */
export function validateSentiment(value: unknown): { ok: true; sentiment: Sentiment } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, sentiment: 'gratitude' }
  if (value === 'gratitude' || value === 'ingratitude') return { ok: true, sentiment: value }
  return { ok: false, error: 'Sentiment must be gratitude or ingratitude' }
}

/**
 * Visibilidade efetiva: ingratidões são sempre privadas, por enquanto,
 * independentemente da escolha do autor.
 */
export function effectiveVisibility(sentiment: Sentiment, isPublic: boolean): boolean {
  return sentiment === 'gratitude' && isPublic
}

/** Há algum agradecimento (mensagem ou emoji)? */
export function hasGratitude(message: string | null, emojis: string[] | null): boolean {
  return message !== null || (emojis !== null && emojis.length > 0)
}
