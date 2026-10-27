import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { weekStartOf } from "./weekStart.ts"
import { candidateIdsFrom, planReminders } from "./reminderPlan.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Mesmo critério do cron-rewards-notify: segredo do cron ou service role
  const authHeader = req.headers.get('Authorization')
  const cronSecret = Deno.env.get('CRON_SECRET')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!authHeader || (authHeader !== `Bearer ${cronSecret}` && authHeader !== `Bearer ${serviceKey}`)) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const admin = createClient(supabaseUrl, serviceKey ?? '')

    const { data: rows, error } = await admin.rpc('gift_gratitude_reminder_candidates')
    if (error) throw error

    const candidates = candidateIdsFrom(rows ?? [])
    const weekStart = weekStartOf(new Date())

    // Um envio por membro e por semana: a gravação só é nova na primeira vez nesta semana
    const { toNotify, failed } = await planReminders(candidates, async (userId) => {
      const { data: inserted, error: insertError } = await admin
        .from('gift_gratitude_reminders')
        .upsert({ user_id: userId, week_start: weekStart }, { onConflict: 'user_id,week_start', ignoreDuplicates: true })
        .select('user_id')
      if (insertError) throw insertError
      return Boolean(inserted && inserted.length > 0)
    })

    if (toNotify.length > 0) {
      // notify-engine entrega por destinatário; uma falha individual não interrompe os demais
      await fetch(`${supabaseUrl}/functions/v1/notify-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') ?? ''}`
        },
        body: JSON.stringify({
          event: 'gift.gratitude_reminder',
          payload: { user_ids: toNotify }
        })
      })
    }

    return new Response(JSON.stringify({ candidates: candidates.length, notified: toNotify.length, failed: failed.length, weekStart }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Gift gratitude reminder error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
