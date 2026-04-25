import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { action, params } = await req.json()

    let responseData: any = null

    switch (action) {
      case 'subscribePush': {
        const { endpoint, authKey, p256dhKey } = params
        if (!endpoint || !authKey || !p256dhKey) throw new Error('Missing subscription details')

        const { data, error } = await supabaseClient
          .from('push_subscriptions')
          .upsert({ 
            user_id: user.id, 
            endpoint, 
            auth_key: authKey, 
            p256dh_key: p256dhKey,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, endpoint' })
          .select()

        if (error) throw error
        responseData = data
        break
      }

      case 'fetchNotifications': {
        const { limit = 50 } = params
        const { data, error } = await supabaseClient
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error) throw error
        responseData = data
        break
      }

      case 'markAsRead': {
        const { id } = params
        if (!id) throw new Error('Missing notification ID')
        
        const { error } = await supabaseClient
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
        
        if (error) throw error
        responseData = { success: true }
        break
      }

      case 'markAllAsRead': {
        const { error } = await supabaseClient
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
        
        if (error) throw error
        responseData = { success: true }
        break
      }

      case 'deleteNotification': {
        const { id } = params
        if (!id) throw new Error('Missing notification ID')

        const { error } = await supabaseClient
          .from('notifications')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        responseData = { success: true }
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
