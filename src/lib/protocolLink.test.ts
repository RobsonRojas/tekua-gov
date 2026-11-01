import { describe, it, expect } from 'vitest';
import { resolveProtocolId, PROTOCOL_LINK_ERROR } from '../../supabase/functions/api-work/protocolLink';

const clientWith = (row: { id: string; status: string } | null, error: unknown = null) => {
  const queried: string[] = [];
  const client = { from: () => ({ select: () => ({ eq: (_c: string, v: string) => { queried.push(v); return { maybeSingle: () => Promise.resolve({ data: row, error }) }; } }) }) };
  return { client, queried };
};

describe('resolveProtocolId', () => {
  it('não informado: não altera nada e não consulta o banco', async () => {
    const { client, queried } = clientWith(null);
    expect(await resolveProtocolId(client, undefined)).toBeUndefined();
    expect(queried).toHaveLength(0);
  });
  it('vazio ou null remove o vínculo', async () => {
    const { client } = clientWith(null);
    expect(await resolveProtocolId(client, null, 'p1')).toBeNull();
    expect(await resolveProtocolId(client, '', 'p1')).toBeNull();
  });
  it('aceita um protocolo ativo', async () => {
    const { client } = clientWith({ id: 'p1', status: 'active' });
    expect(await resolveProtocolId(client, 'p1')).toBe('p1');
  });
  it('recusa protocolo arquivado, inexistente ou com erro de consulta', async () => {
    await expect(resolveProtocolId(clientWith({ id: 'p1', status: 'archived' }).client, 'p1')).rejects.toThrow(PROTOCOL_LINK_ERROR);
    await expect(resolveProtocolId(clientWith(null).client, 'x')).rejects.toThrow(PROTOCOL_LINK_ERROR);
    await expect(resolveProtocolId(clientWith(null, { code: '22P02' }).client, 'nao-uuid')).rejects.toThrow(PROTOCOL_LINK_ERROR);
    await expect(resolveProtocolId(clientWith(null).client, 42)).rejects.toThrow(PROTOCOL_LINK_ERROR);
  });
  it('na edição, manter o protocolo atual vale mesmo arquivado, sem consultar', async () => {
    const { client, queried } = clientWith({ id: 'p1', status: 'archived' });
    expect(await resolveProtocolId(client, 'p1', 'p1')).toBe('p1');
    expect(queried).toHaveLength(0);
  });
});
