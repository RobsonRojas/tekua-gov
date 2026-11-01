import { describe, it, expect } from 'vitest';
import {
  isValidEvidenceLink,
  normalizeEvidenceAttachments,
  INVALID_EVIDENCE_LINK_ERROR,
} from '../../supabase/functions/api-work/evidenceLinks';
import { recordEvidence } from '../../supabase/functions/api-work/taskCompletion';

describe('isValidEvidenceLink', () => {
  it('aceita somente http e https', () => {
    expect(isValidEvidenceLink('https://chat.whatsapp.com/abc')).toBe(true);
    expect(isValidEvidenceLink('http://exemplo.org')).toBe(true);
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'ftp://x.org', 'file:///etc/passwd', 'exemplo.org', '', '   ', null, 42]) {
      expect(isValidEvidenceLink(bad)).toBe(false);
    }
  });
  it('recusa endereço acima do limite', () => {
    expect(isValidEvidenceLink('https://a.org/' + 'x'.repeat(2000))).toBe(false);
  });
});

describe('normalizeEvidenceAttachments', () => {
  it('normaliza o link: sem tamanho e com o endereço como nome', () => {
    const [a] = normalizeEvidenceAttachments([{ file_url: ' https://a.org/x ', file_type: 'link', file_size: 9 }]);
    expect(a).toMatchObject({ file_url: 'https://a.org/x', file_name: 'https://a.org/x', file_size: null, file_type: 'link' });
  });
  it('mantém arquivos comuns e descarta itens sem endereço', () => {
    const out = normalizeEvidenceAttachments([{ file_url: 'https://s/f.png', file_type: 'image/png', file_size: 5 }, { file_url: '' }, null]);
    expect(out).toHaveLength(1);
  });
  it('falha com link inválido', () => {
    expect(() => normalizeEvidenceAttachments([{ file_url: 'javascript:alert(1)', file_type: 'link' }])).toThrow(INVALID_EVIDENCE_LINK_ERROR);
  });
});

describe('recordEvidence com links', () => {
  const makeClient = () => {
    const inserts: any[] = [];
    const client: any = { from: (table: string) => ({ insert: (rows: any) => { inserts.push([table, rows]); return Promise.resolve({ error: null }); } }) };
    return { client, inserts };
  };
  it('grava o link como evidência', async () => {
    const { client, inserts } = makeClient();
    await recordEvidence(client, 'u1', 'a1', { attachments: [{ file_url: 'https://a.org', file_type: 'link' }] });
    expect(inserts).toHaveLength(1);
    expect(inserts[0][1][0]).toMatchObject({ file_type: 'link', is_evidence: true, file_size: null });
  });
  it('recusa link inválido sem gravar nada', async () => {
    const { client, inserts } = makeClient();
    await expect(recordEvidence(client, 'u1', 'a1', { evidenceUrl: 'https://ok.org', attachments: [{ file_url: 'javascript:x', file_type: 'link' }] })).rejects.toThrow();
    expect(inserts).toHaveLength(0);
  });
});
