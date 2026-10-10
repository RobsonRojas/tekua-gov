import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { checkRateLimit, getResponseHeaders } from "../_shared/security.ts"

// Sender and recipient are ALWAYS fixed. The caller cannot override them.
const FIXED_ADDRESS = 'contato@tekua.com.br'

const MAX_SUBJECT_LENGTH = 200
const MAX_BODY_LENGTH = 20000
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_SECONDS = 60
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const corsHeaders = getResponseHeaders({
  // x-api-token must be allowed for browser preflight requests.
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/**
 * Constant-time comparison of two strings.
 * Compares SHA-256 digests so that neither string length nor match position
 * leaks through timing, and there is no early return on mismatch.
 */
async function secretEquals(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ])
  const bytesA = new Uint8Array(digestA)
  const bytesB = new Uint8Array(digestB)
  let diff = 0
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i]
  return diff === 0
}

/** Reads the caller-supplied token from x-api-token, falling back to Bearer auth. */
function extractProvidedToken(req: Request): string | null {
  const headerToken = req.headers.get('x-api-token')
  if (headerToken && headerToken.trim()) return headerToken.trim()

  const auth = req.headers.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()

  return null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // 1. Rate limiting by IP, before doing any work.
    const clientIp = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    const rateLimit = await checkRateLimit(supabaseClient, {
      key: `api:external-emails:${clientIp}`,
      limit: RATE_LIMIT_MAX,
      windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
    })
    if (!rateLimit.allowed) {
      return jsonResponse({ error: 'rate_limited' }, 429)
    }

    // 2. Authorization via secret token (fail closed if not configured).
    const expectedToken = Deno.env.get('EXTERNAL_EMAILS_TOKEN')
    const providedToken = extractProvidedToken(req)
    if (!expectedToken || !providedToken || !(await secretEquals(providedToken, expectedToken))) {
      // Generic response: never reveal whether the token is configured.
      return jsonResponse({ error: 'unauthorized' }, 401)
    }

    // 3. Parse and validate the payload.
    let payload: any
    try {
      payload = await req.json()
    } catch {
      return jsonResponse({ error: 'invalid_json' }, 400)
    }

    const subject = typeof payload?.subject === 'string' ? payload.subject.trim() : ''
    const body = typeof payload?.body === 'string' ? payload.body : ''
    const replyTo = typeof payload?.replyTo === 'string' ? payload.replyTo.trim() : ''

    if (!subject) return jsonResponse({ error: 'missing_subject' }, 400)
    if (subject.length > MAX_SUBJECT_LENGTH) {
      return jsonResponse({ error: 'subject_too_long', max: MAX_SUBJECT_LENGTH }, 400)
    }
    if (!body) return jsonResponse({ error: 'missing_body' }, 400)
    if (body.length > MAX_BODY_LENGTH) {
      return jsonResponse({ error: 'body_too_long', max: MAX_BODY_LENGTH }, 400)
    }
    if (replyTo && !EMAIL_RE.test(replyTo)) {
      return jsonResponse({ error: 'invalid_reply_to' }, 400)
    }

    // Any `to`/`from` sent by the caller is intentionally ignored:
    // sender and recipient are always FIXED_ADDRESS.

    // 4. Enqueue for resilient delivery (processed by cron_retry_emails).
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: queued, error: insertError } = await supabaseAdmin
      .from('email_queue')
      .insert({
        email: FIXED_ADDRESS,
        type: 'external',
        subject,
        body,
        from_email: FIXED_ADDRESS,
        reply_to: replyTo || null,
        status: 'pending',
        error_message: null,
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    // 5. Best-effort immediate processing; the scheduled retry is the safety net.
    try {
      await supabaseAdmin.functions.invoke('cron_retry_emails')
    } catch (triggerError) {
      console.warn(
        'Immediate processing trigger failed (delivery will retry on schedule):',
        (triggerError as Error)?.message,
      )
    }

    return jsonResponse({ success: true, id: queued?.id ?? null, status: 'queued' }, 202)
  } catch (error) {
    // Generic server error: never leak secrets or internal details.
    console.error('api-external-emails error:', (error as Error)?.message)
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})
