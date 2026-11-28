// Shared helper: generates a one-time password-setup link and emails it to the user.
// Used by api-members (admin button + new member signup) and cron_retry_emails (legacy rows).

declare const Deno: any

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'contato@tekua.com.br'

export type PasswordEmailFlow = 'invite' | 'reset'

export const EMAIL_NOT_CONFIGURED = 'EMAIL_NOT_CONFIGURED'

/** Thrown when server-side email settings (SITE_URL / RESEND_API_KEY) are missing or invalid. */
export class EmailConfigError extends Error {
  code = EMAIL_NOT_CONFIGURED
  missing: string
  constructor(missing: string, detail?: string) {
    super(`${missing} is not configured${detail ? ` (${detail})` : ''}`)
    this.name = 'EmailConfigError'
    this.missing = missing
  }
}

/** Accepts only absolute https URLs (http allowed for localhost, for development). */
export function isValidSiteUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === 'localhost')
  } catch {
    return false
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildSetupUrl(siteUrl: string, email: string, tokenHash: string, flow: PasswordEmailFlow): string {
  const base = siteUrl.replace(/\/+$/, '')
  const params = new URLSearchParams({ e: email, t: tokenHash, flow })
  return `${base}/reset-password?${params.toString()}`
}

export function buildPasswordEmail(flow: PasswordEmailFlow, url: string, fullName?: string | null) {
  const name = fullName ? escapeHtml(fullName) : ''
  const greeting = name ? `Olá, ${name}!` : 'Olá!'
  const safeUrl = escapeHtml(url)
  const isInvite = flow === 'invite'

  const subject = isInvite
    ? 'Finalize seu cadastro na Tekuá'
    : 'Troca de senha - Tekuá'
  const intro = isInvite
    ? 'Seu cadastro na plataforma Tekuá foi realizado. Para finalizá-lo, defina sua senha de acesso clicando no botão abaixo.'
    : 'Um administrador enviou este link para você definir uma nova senha de acesso à plataforma Tekuá.'
  const cta = isInvite ? 'Finalizar cadastro e definir senha' : 'Definir nova senha'

  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
<h2>${greeting}</h2>
<p>${intro}</p>
<p style="margin:28px 0"><a href="${safeUrl}" style="background:#16a34a;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold">${cta}</a></p>
<p style="font-size:13px;color:#64748b">Se o botão não funcionar, copie e cole este link no navegador:<br>${safeUrl}</p>
<p style="font-size:13px;color:#64748b">O link é de uso único e expira em breve. Se você não esperava este e-mail, ignore-o.</p>
</div>`

  return { subject, html }
}

/**
 * Generates a recovery token for the user, builds the link to our own /reset-password
 * page and emails it. Falls back to email_queue when immediate delivery fails.
 */
export async function sendPasswordSetupEmail(
  supabaseAdmin: any,
  params: { email: string; flow: PasswordEmailFlow; fullName?: string | null; queueOnFailure?: boolean },
): Promise<{ status: 'sent' | 'queued' }> {
  const siteUrl = Deno.env.get('SITE_URL')
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!siteUrl) throw new EmailConfigError('SITE_URL')
  if (!isValidSiteUrl(siteUrl)) throw new EmailConfigError('SITE_URL', 'must be an absolute https URL')
  if (!resendApiKey) throw new EmailConfigError('RESEND_API_KEY')

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: params.email,
  })
  if (linkError) throw linkError
  const tokenHash = linkData?.properties?.hashed_token
  if (!tokenHash) throw new Error('Failed to generate password setup token')

  const url = buildSetupUrl(siteUrl, params.email, tokenHash, params.flow)
  const { subject, html } = buildPasswordEmail(params.flow, url, params.fullName)
  const from = Deno.env.get('EMAIL_FROM') || DEFAULT_FROM

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: params.email, subject, html }),
    })
    if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`)
    return { status: 'sent' }
  } catch (sendError: any) {
    if (params.queueOnFailure === false) throw sendError
    await supabaseAdmin.from('email_queue').insert({
      email: params.email,
      type: 'external',
      status: 'pending',
      subject,
      body: html,
      from_email: from,
      error_message: sendError?.message ?? null,
    })
    return { status: 'queued' }
  }
}
