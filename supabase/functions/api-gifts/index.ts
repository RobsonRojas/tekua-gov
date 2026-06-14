import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { checkRateLimit, getResponseHeaders } from "../_shared/security.ts"

const corsHeaders = getResponseHeaders();

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
        const { title, description } = params
        if (!title || !description) throw new Error('Missing title or description')

        const { data, error } = await supabaseClient
          .from('gifts')
          .insert({
            title: typeof title === 'string' ? { pt: title, en: title } : title,
            description: typeof description === 'string' ? { pt: description, en: description } : description,
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
        const { giftId } = params
        if (!giftId) throw new Error('Missing giftId')

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

        // Check if user already used this gift recently to prevent spam? Not required by spec, but good practice.
        // For now, just call the RPC
        const { data, error } = await supabaseClient.rpc('award_gift_points', {
          p_gift_id: giftId,
          p_consumer_id: user.id
        })

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
