/**
 * Validação de links de acesso (ex.: link de uma dádiva).
 *
 * A regra é a mesma usada na Edge Function `api-gifts`: aceitar somente URLs
 * absolutas http/https, descartando protocolos perigosos (javascript:, data:,
 * file:, ...) tanto no cadastro quanto na renderização.
 */

/** URL absoluta http/https válida? */
export const isValidHttpUrl = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/** Campo de link é opcional: vazio conta como válido. */
export const isOptionalHttpUrl = (value: string): boolean => !value.trim() || isValidHttpUrl(value);

/** Retorna a URL normalizada (trim) quando válida, ou null. */
export const normalizeHttpUrl = (value: unknown): string | null =>
  isValidHttpUrl(value) ? (value as string).trim() : null;
