import { describe, it, expect, vi } from 'vitest';
import { buildCommentUrl, buildTopicUrl, commentIdFromHash, copyToClipboard } from './topicLinks';

describe('topicLinks', () => {
  it('monta links da pauta e do comentário', () => {
    expect(buildTopicUrl('t1', 'https://x.org')).toBe('https://x.org/voting/t1');
    expect(buildCommentUrl('t1', 'c9', 'https://x.org')).toBe('https://x.org/voting/t1#comment-c9');
  });

  it('extrai o id do comentário do hash', () => {
    expect(commentIdFromHash('#comment-c9')).toBe('c9');
    expect(commentIdFromHash('#outra')).toBeNull();
    expect(commentIdFromHash('')).toBeNull();
  });

  it('copia para a área de transferência e informa falha', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    expect(await copyToClipboard('abc')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('abc');
    writeText.mockRejectedValueOnce(new Error('denied'));
    expect(await copyToClipboard('abc')).toBe(false);
  });
});
