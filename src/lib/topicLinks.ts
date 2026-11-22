export function buildTopicUrl(topicId: string, origin: string = window.location.origin): string {
  return `${origin}/voting/${topicId}`;
}

export function buildCommentUrl(topicId: string, commentId: string, origin: string = window.location.origin): string {
  return `${buildTopicUrl(topicId, origin)}#comment-${commentId}`;
}

// Extrai o id do comentário de um hash "#comment-<id>", ou null.
export function commentIdFromHash(hash: string): string | null {
  const m = /^#comment-(.+)$/.exec(hash);
  return m ? m[1] : null;
}

// Copia texto para a área de transferência; devolve false se não for possível.
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
