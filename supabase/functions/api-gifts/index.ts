import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { checkRateLimit, getResponseHeaders } from "../_shared/security.ts"
import { effectiveVisibility, validateGratitude, validateSentiment } from "./giftGratitude.ts"

const corsHeaders = getResponseHeaders();

/**
 * Normaliza o link de acesso opcional de uma dádiva.
 * Retorna null quando ausente/vazio e rejeita qualquer valor que não seja
 * uma URL absoluta http/https (bloqueia javascript:, data:, file:, etc.).
 */
const normalizeLinkUrl = (value: unknown): string | null => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') throw new Error('Invalid link: expected a string')

  const trimmed = value.trim()
  if (!trimmed) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('Invalid link: must be an absolute http/https URL')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Invalid link: only http and https URLs are allowed')
  }

  return parsed.toString()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // Rate Limiting
    const rateLimit = await checkRateLimit(supabaseClient, {
      key: `api:gifts:${user.id}`,
      limit: 30, // 30 req per minute
      windowSeconds: 60
    });

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        headers: corsHeaders,
        status: 429,
      })
    }

    const { action, params } = await req.json()

    let responseData: any = null

    switch (action) {
      case 'createGift': {
        const { title, description, linkUrl, link_url } = params
        if (!title || !description) throw new Error('Missing title or description')

        const link = normalizeLinkUrl(linkUrl ?? link_url)

        const { data, error } = await supabaseClient
          .from('gifts')
          .insert({
            title: typeof title === 'string' ? { pt: title, en: title } : title,
            description: typeof description === 'string' ? { pt: description, en: description } : description,
            link_url: link,
            provider_id: user.id,
            status: 'active'
          })
          .select()
          .single()

        if (error) throw error
        responseData = data
        break
      }

      case 'fetchGifts': {
        const { limit = 50 } = params

        // `*` already includes link_url, so the link travels to the client with
        // no extra serialization work.
        const { data, error } = await supabaseClient
          .from('gifts')
          .select(`
            *,
            provider:profiles!provider_id (id, full_name, avatar_url)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        responseData = data
        break
      }

      case 'recordUsage': {
        const { giftId, thanksMessage, thanksEmojis, isPublic, sentiment: rawSentiment } = params
        if (!giftId) throw new Error('Missing giftId')

        const gratitude = validateGratitude({ message: thanksMessage, emojis: thanksEmojis })
        if (!gratitude.ok) throw new Error(gratitude.error)
        const sentimentCheck = validateSentiment(rawSentiment)
        if (!sentimentCheck.ok) throw new Error(sentimentCheck.error)
        const sentiment = sentimentCheck.sentiment

        // Fetch gift to check if provider is same as consumer
        const { data: gift } = await supabaseClient
          .from('gifts')
          .select('provider_id')
          .eq('id', giftId)
          .single()

        if (!gift) throw new Error('Gift not found')
        if (gift.provider_id === user.id) {
          throw new Error('You cannot record usage of your own gift')
        }

        // Os Pontos de Dádiva são contabilizados pela mesma RPC, com ou sem agradecimento
        const { data, error } = await supabaseClient.rpc('award_gift_points', {
          p_gift_id: giftId,
          p_consumer_id: user.id,
          p_thanks_message: gratitude.message,
          p_thanks_emojis: gratitude.emojis,
          p_is_public: effectiveVisibility(sentiment, isPublic !== false),
          p_sentiment: sentiment
        })

        if (error) throw error
        responseData = data
        break
      }

      case 'fetchMyUsages': {
        // Histórico das próprias dádivas utilizadas (RLS libera as próprias linhas)
        const { data, error } = await supabaseClient
          .from('gift_usages')
          .select('id, created_at, thanks_message, thanks_emojis, is_public, sentiment, gift:gifts(id, title)')
          .eq('consumer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        responseData = data
        break
      }

      case 'updateUsageGratitude': {
        const { usageId, thanksMessage, thanksEmojis } = params
        if (!usageId) throw new Error('Missing usageId')

        const gratitude = validateGratitude({ message: thanksMessage, emojis: thanksEmojis })
        if (!gratitude.ok) throw new Error(gratitude.error)

        // Somente o consumidor que registrou o uso pode alterar o agradecimento
        const { data, error } = await supabaseAdmin
          .from('gift_usages')
          .update({ thanks_message: gratitude.message, thanks_emojis: gratitude.emojis })
          .eq('id', usageId)
          .eq('consumer_id', user.id)
          .select('id, thanks_message, thanks_emojis, is_public')
          .maybeSingle()

        if (error) throw error
        if (!data) throw new Error('Usage not found or not yours')
        responseData = data
        break
      }

      case 'setUsageVisibility': {
        const { usageId, isPublic } = params
        if (!usageId) throw new Error('Missing usageId')
        if (typeof isPublic !== 'boolean') throw new Error('isPublic must be a boolean')

        // Somente o autor do registro altera a visibilidade. Ingratidões permanecem privadas por enquanto.
        const { data: current, error: currentError } = await supabaseAdmin
          .from('gift_usages')
          .select('sentiment')
          .eq('id', usageId)
          .eq('consumer_id', user.id)
          .maybeSingle()
        if (currentError) throw currentError
        if (!current) throw new Error('Usage not found or not yours')
        if (isPublic && !effectiveVisibility(current.sentiment, true)) {
          throw new Error('Ingratidões permanecem privadas por enquanto')
        }

        const { data, error } = await supabaseAdmin
          .from('gift_usages')
          .update({ is_public: isPublic })
          .eq('id', usageId)
          .eq('consumer_id', user.id)
          .select('id, is_public')
          .maybeSingle()

        if (error) throw error
        if (!data) throw new Error('Usage not found or not yours')
        responseData = data
        break
      }

      case 'fetchGratitudeDashboard': {
        // Dashboard público: somente registros públicos com algum agradecimento
        const { data, error } = await supabaseClient
          .from('gift_usages')
          .select(`
            id, created_at, thanks_message, thanks_emojis,
            consumer:profiles!consumer_id (full_name),
            gift:gifts (id, title, provider:profiles!provider_id (full_name))
          `)
          .eq('is_public', true)
          .eq('sentiment', 'gratitude')
          .or('thanks_message.not.is.null,thanks_emojis.not.is.null')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        responseData = data
        break
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify({ data: responseData, error: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ data: null, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
