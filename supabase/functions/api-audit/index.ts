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

    // Verify user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { action, params } = await req.json()

    let responseData: any = null

    switch (action) {
      case 'fetchLogs': {
        const { limit = 50, filter = 'all' } = params
        let query = supabaseClient
          .from('audit_logs')
          .select('*')
          .eq('actor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (filter !== 'all') {
          query = query.eq('action', filter)
        }

        const { data, error } = await query
        if (error) throw error
        responseData = data
        break
      }

      case 'fetchAdminLogs': {
        // Check if admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'admin') throw new Error('Forbidden')

        const { limit = 100, page = 0, pageSize = 20, filters = {} } = params
        let query = supabaseAdmin
          .from('audit_logs')
          .select('*, profiles:actor_id(full_name, email)', { count: 'exact' })

        if (filters.actionType && filters.actionType !== 'all') {
          query = query.eq('action', filters.actionType)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) throw error
        responseData = { logs: data, count }
        break
      }

      case 'logActivity': {
        const { action: actionType, description, metadata = {} } = params
        const { data, error } = await supabaseAdmin
          .from('audit_logs')
          .insert({
            actor_id: user.id,
            action: actionType,
            description,
            metadata
          })
          .select()

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
      status: error.message === 'Unauthorized' ? 401 : (error.message === 'Forbidden' ? 403 : 400),
    })
  }
})
