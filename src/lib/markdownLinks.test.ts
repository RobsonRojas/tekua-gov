import { describe, it, expect } from 'vitest';
import { shortenBareUrls } from './markdownLinks';

describe('shortenBareUrls (3.3: link no card)', () => {
  it('shows a bare long URL as a short link with the site name', () => {
    const text = 'Veja mais em https://www.exemplo.org/projetos/horta/2026/relatorio-completo-com-muitos-detalhes';
    expect(shortenBareUrls(text)).toBe(
      'Veja mais em [exemplo.org](https://www.exemplo.org/projetos/horta/2026/relatorio-completo-com-muitos-detalhes)'
    );
  });

  it('keeps punctuation that follows the URL outside the link', () => {
    expect(shortenBareUrls('Confira https://exemplo.org/a.')).toBe('Confira [exemplo.org](https://exemplo.org/a).');
  });

  it('does not change links that are already Markdown', () => {
    const text = 'Veja [o relatório](https://exemplo.org/relatorio)';
    expect(shortenBareUrls(text)).toBe(text);
  });

  it('does not change text without links', () => {
    expect(shortenBareUrls('Plantio no sábado, às 8h.')).toBe('Plantio no sábado, às 8h.');
  });

  it('shortens several URLs in the same description', () => {
    expect(shortenBareUrls('https://a.org/x e https://b.org/y')).toBe('[a.org](https://a.org/x) e [b.org](https://b.org/y)');
  });
});
