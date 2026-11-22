export interface ThreadableComment {
  id: string;
  parent_id?: string | null;
}

export interface CommentThread<T extends ThreadableComment> {
  comment: T;
  replies: T[];
}

// Agrupa comentários em raízes com suas respostas (um nível), preservando a ordem de entrada.
// Respostas cujo pai não está na lista viram raízes, para nunca esconder conteúdo.
export function buildCommentThreads<T extends ThreadableComment>(comments: T[]): CommentThread<T>[] {
  const ids = new Set(comments.map((c) => c.id));
  const threads = new Map<string, CommentThread<T>>();
  for (const c of comments) {
    if (!c.parent_id || !ids.has(c.parent_id)) threads.set(c.id, { comment: c, replies: [] });
  }
  for (const c of comments) {
    if (c.parent_id && ids.has(c.parent_id)) {
      threads.get(c.parent_id)?.replies.push(c);
    }
  }
  return [...threads.values()];
}

export interface TextPart {
  text: string;
  mention: boolean;
}

// Divide o texto marcando as ocorrências de "@Nome" dos membros mencionados.
export function splitMentions(text: string, names: string[]): TextPart[] {
  const tokens = [...new Set(names.filter(Boolean))]
    .sort((a, b) => b.length - a.length)
    .map((n) => `@${n}`);
  if (tokens.length === 0 || !text) return [{ text, mention: false }];
  const escaped = tokens.map((tk) => tk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'g');
  return text
    .split(re)
    .filter((p) => p !== '')
    .map((p) => ({ text: p, mention: tokens.includes(p) }));
}
