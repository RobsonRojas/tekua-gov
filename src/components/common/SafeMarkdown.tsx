import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface SafeMarkdownProps {
  content: string;
  /**
   * Aplica este target aos links gerados pelo Markdown (ex.: '_blank').
   * Quando '_blank', o link recebe `rel="noopener noreferrer"`.
   */
  linkTarget?: React.HTMLAttributeAnchorTarget;
  /**
   * Conflui o conteúdo renderizado na largura do container: palavras e URLs
   * longas quebram, e blocos de código, tabelas e imagens não estouram a
   * largura disponível. Sem esta prop o componente mantém o comportamento
   * anterior (Markdown puro, sem wrapper).
   */
  contained?: boolean;
  /** Estilos extras do container (implica o uso do wrapper). */
  sx?: SxProps<Theme>;
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
 * Mantém todo o Markdown dentro da largura do container.
 * Usado pela visão de detalhes da dádiva, onde o texto não pode vazar do card.
 */
const containmentSx: SxProps<Theme> = {
  minWidth: 0,
  maxWidth: '100%',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  '& *': { maxWidth: '100%' },
  '& img': { height: 'auto' },
  '& pre': { overflowX: 'auto' },
  '& table': { display: 'block', overflowX: 'auto' },
  '& h1': { fontSize: '1.4em' },
  '& h2': { fontSize: '1.25em' },
  '& h3': { fontSize: '1.1em' },
  '& h4, & h5, & h6': { fontSize: '1em' },
  '& p': { mt: 0, mb: 1 },
  '& > :first-of-type': { mt: 0 },
  '& > :last-child': { mb: 0 },
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
const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ content, linkTarget, contained, sx }) => {
  const sanitized = useMemo(() => {
    return DOMPurify.sanitize(content ?? '', {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }, [content]);

  const components = useMemo(() => {
    if (!linkTarget) return undefined;
    return {
      a: ({ node: _node, ...props }: any) => (
        <a
          {...props}
          target={linkTarget}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
        />
      ),
    };
  }, [linkTarget]);

  const markdown = (
    <ReactMarkdown urlTransform={safeUrlTransform} components={components}>
      {sanitized}
    </ReactMarkdown>
  );

  let containerSx: SxProps<Theme> | undefined;
  if (contained && sx) containerSx = { ...containmentSx, ...(sx as Record<string, unknown>) };
  else if (contained) containerSx = containmentSx;
  else if (sx) containerSx = sx;

  // Sem estilização pedida: mantém o Markdown puro (comportamento anterior).
  if (!containerSx) return markdown;

  return <Box sx={containerSx}>{markdown}</Box>;
};

export default SafeMarkdown;
