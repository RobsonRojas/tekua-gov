import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

interface SafeMarkdownProps {
  content: string;
}

/**
 * Verifica se a URL é segura para uso em links/imagens renderizados pelo Markdown.
 * Bloqueia protocolos perigosos (javascript:, data:, vbscript:, file:) e permite
 * apenas URLs relativas e protocolos conhecidos.
 */
const safeUrlTransform = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  // URLs relativas ou âncoras
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('?')
  ) {
    return trimmed;
  }
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  if (!match) return trimmed; // sem protocolo explícito
  const protocol = match[1].toLowerCase();
  return ['http', 'https', 'mailto', 'tel'].includes(protocol) ? trimmed : '';
};

/**
 * SafeMarkdown Component
 *
 * Renderiza respostas de modelos de IA (Edge Functions) como Markdown de forma
 * segura contra injeções web (XSS):
 *  1. DOMPurify remove qualquer tag HTML crua (script, iframe, img com onerror,
 *     etc.) do texto bruto antes da renderização;
 *  2. ReactMarkdown (sem rehype-raw) não renderiza HTML cru remanescente;
 *  3. urlTransform bloqueia URLs perigosas (javascript:, data:, vbscript:, file:).
 */
const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ content }) => {
  const sanitized = useMemo(() => {
    return DOMPurify.sanitize(content ?? '', {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }, [content]);

  return <ReactMarkdown urlTransform={safeUrlTransform}>{sanitized}</ReactMarkdown>;
};

export default SafeMarkdown;