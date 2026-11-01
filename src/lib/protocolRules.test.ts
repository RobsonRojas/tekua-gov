import { describe, it, expect } from 'vitest';
import {
  canWriteProtocols,
  validateProtocolInput,
  isProtocolStatus,
  MAX_PROTOCOL_TITLE,
  MAX_PROTOCOL_CONTENT,
} from '../../supabase/functions/api-governance/protocolRules';

describe('canWriteProtocols', () => {
  it('permite administrador e Conselho, pelo papel principal ou pela lista de papéis', () => {
    expect(canWriteProtocols('admin', null)).toBe(true);
    expect(canWriteProtocols('transversal_council', null)).toBe(true);
    expect(canWriteProtocols('member', ['member', 'transversal_council'])).toBe(true);
    expect(canWriteProtocols('member', ['admin'])).toBe(true);
  });
  it('nega membro comum e dados ausentes', () => {
    expect(canWriteProtocols('member', ['member'])).toBe(false);
    expect(canWriteProtocols(undefined, undefined)).toBe(false);
    expect(canWriteProtocols(null, 'admin')).toBe(false);
  });
});

describe('validateProtocolInput', () => {
  it('aceita e apara o título', () => {
    expect(validateProtocolInput({ title: '  POP da horta  ', content: '# Passos' })).toEqual({ ok: true, title: 'POP da horta', content: '# Passos' });
  });
  it('conteúdo ausente vira texto vazio', () => {
    expect(validateProtocolInput({ title: 'X' })).toEqual({ ok: true, title: 'X', content: '' });
  });
  it('recusa título vazio ou longo demais', () => {
    expect(validateProtocolInput({ title: '   ' }).ok).toBe(false);
    expect(validateProtocolInput({ title: 'a'.repeat(MAX_PROTOCOL_TITLE + 1) }).ok).toBe(false);
  });
  it('recusa conteúdo longo demais', () => {
    expect(validateProtocolInput({ title: 'X', content: 'a'.repeat(MAX_PROTOCOL_CONTENT + 1) }).ok).toBe(false);
  });
});

describe('isProtocolStatus', () => {
  it('aceita somente active e archived', () => {
    expect(isProtocolStatus('active')).toBe(true);
    expect(isProtocolStatus('archived')).toBe(true);
    expect(isProtocolStatus('deleted')).toBe(false);
  });
});
