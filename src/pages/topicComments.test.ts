import { describe, it, expect } from 'vitest';
import { buildCommentThreads, splitMentions } from './topicComments';

describe('buildCommentThreads', () => {
  it('agrupa respostas sob o comentário pai, mantendo a ordem', () => {
    const t = buildCommentThreads([
      { id: 'a' }, { id: 'b' }, { id: 'a1', parent_id: 'a' }, { id: 'a2', parent_id: 'a' }, { id: 'b1', parent_id: 'b' },
    ]);
    expect(t.map((x) => x.comment.id)).toEqual(['a', 'b']);
    expect(t[0].replies.map((r) => r.id)).toEqual(['a1', 'a2']);
    expect(t[1].replies.map((r) => r.id)).toEqual(['b1']);
  });

  it('resposta órfã vira comentário raiz', () => {
    const t = buildCommentThreads([{ id: 'x', parent_id: 'missing' }]);
    expect(t.map((x) => x.comment.id)).toEqual(['x']);
  });
});

describe('splitMentions', () => {
  it('destaca @Nome dos mencionados', () => {
    expect(splitMentions('Oi @Ana Souza, veja', ['Ana Souza'])).toEqual([
      { text: 'Oi ', mention: false },
      { text: '@Ana Souza', mention: true },
      { text: ', veja', mention: false },
    ]);
  });

  it('prefere o nome mais longo e ignora @ não registrado', () => {
    const parts = splitMentions('@Ana Maria e @Bob', ['Ana', 'Ana Maria']);
    expect(parts.filter((p) => p.mention).map((p) => p.text)).toEqual(['@Ana Maria']);
  });

  it('sem nomes devolve o texto inteiro', () => {
    expect(splitMentions('texto', [])).toEqual([{ text: 'texto', mention: false }]);
  });
});
