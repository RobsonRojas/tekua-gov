/**
 * Mostra URLs soltas em uma descrição como links curtos, com o nome do site.
 * Uma URL longa sem espaços não quebra no card e estoura a largura; como link
 * Markdown, o leitor vê só o nome do site e a URL completa continua clicável.
 * Links que já estão em Markdown `[texto](url)` não são alterados.
 */
const BARE_URL = /(^|\s)(https?:\/\/[^\s)<>]+)/g;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

export function shortenBareUrls(content: string): string {
  return content.replace(BARE_URL, (match, lead: string, rawUrl: string) => {
    const trailing = TRAILING_PUNCTUATION.exec(rawUrl)?.[0] ?? '';
    const url = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      return `${lead}[${host}](${url})${trailing}`;
    } catch {
      return match;
    }
  });
}
