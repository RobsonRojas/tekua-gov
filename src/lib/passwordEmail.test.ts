import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildSetupUrl,
  buildPasswordEmail,
  sendPasswordSetupEmail,
  EmailConfigError,
  isValidSiteUrl,
} from '../../supabase/functions/_shared/password-email';

const env: Record<string, string | undefined> = {};
(globalThis as any).Deno = { env: { get: (k: string) => env[k] } };

const makeAdmin = (linkResult: any) => {
  const insert = vi.fn().mockResolvedValue({});
  return {
    insert,
    client: {
      auth: { admin: { generateLink: vi.fn().mockResolvedValue(linkResult) } },
      from: vi.fn().mockReturnValue({ insert }),
    },
  };
};

describe('password-email helper', () => {
  beforeEach(() => {
    env.SITE_URL = 'https://app.tekua.com.br/';
    env.RESEND_API_KEY = 'key';
    vi.restoreAllMocks();
  });

  it('builds the link to our own reset-password page', () => {
    const url = buildSetupUrl('https://app.tekua.com.br/', 'a+b@x.com', 'hash123', 'invite');
    expect(url).toBe('https://app.tekua.com.br/reset-password?e=a%2Bb%40x.com&t=hash123&flow=invite');
  });

  it('uses signup wording for invite and escapes the name', () => {
    const { subject, html } = buildPasswordEmail('invite', 'https://x/y', '<b>Ana</b>');
    expect(subject).toMatch(/Finalize seu cadastro/);
    expect(html).not.toContain('<b>Ana</b>');
  });

  it('fails explicitly without SITE_URL', async () => {
    delete env.SITE_URL;
    const { client } = makeAdmin({ data: { properties: { hashed_token: 't' } }, error: null });
    const promise = sendPasswordSetupEmail(client, { email: 'a@x.com', flow: 'reset' });
    await expect(promise).rejects.toBeInstanceOf(EmailConfigError);
    await expect(promise).rejects.toMatchObject({ code: 'EMAIL_NOT_CONFIGURED', missing: 'SITE_URL' });
    expect(client.auth.admin.generateLink).not.toHaveBeenCalled();
  });

  it('rejects a SITE_URL that is not https', async () => {
    env.SITE_URL = 'ftp://app.tekua.com.br';
    const { client } = makeAdmin({ data: { properties: { hashed_token: 't' } }, error: null });
    await expect(sendPasswordSetupEmail(client, { email: 'a@x.com', flow: 'reset' })).rejects.toBeInstanceOf(EmailConfigError);
  });

  it('fails explicitly without RESEND_API_KEY', async () => {
    delete env.RESEND_API_KEY;
    const { client } = makeAdmin({ data: { properties: { hashed_token: 't' } }, error: null });
    await expect(sendPasswordSetupEmail(client, { email: 'a@x.com', flow: 'reset' })).rejects.toMatchObject({ missing: 'RESEND_API_KEY' });
  });

  it('validates site urls', () => {
    expect(isValidSiteUrl('https://app.tekua.com.br')).toBe(true);
    expect(isValidSiteUrl('http://localhost:5173')).toBe(true);
    expect(isValidSiteUrl('http://app.tekua.com.br')).toBe(false);
    expect(isValidSiteUrl('app.tekua.com.br')).toBe(false);
  });

  it('returns sent when Resend accepts', async () => {
    const { client, insert } = makeAdmin({ data: { properties: { hashed_token: 't' } }, error: null });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const r = await sendPasswordSetupEmail(client, { email: 'a@x.com', flow: 'reset' });
    expect(r.status).toBe('sent');
    expect(insert).not.toHaveBeenCalled();
  });

  it('queues when Resend fails', async () => {
    const { client, insert } = makeAdmin({ data: { properties: { hashed_token: 't' } }, error: null });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' }));
    const r = await sendPasswordSetupEmail(client, { email: 'a@x.com', flow: 'invite' });
    expect(r.status).toBe('queued');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ type: 'external', email: 'a@x.com' }));
  });

  it('does not queue when queueOnFailure is false', async () => {
    const { client, insert } = makeAdmin({ data: { properties: { hashed_token: 't' } }, error: null });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' }));
    await expect(
      sendPasswordSetupEmail(client, { email: 'a@x.com', flow: 'invite', queueOnFailure: false }),
    ).rejects.toThrow('Resend 500');
    expect(insert).not.toHaveBeenCalled();
  });
});
