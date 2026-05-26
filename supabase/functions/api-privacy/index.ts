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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { action, params } = await req.json()

    let responseData: any = null

    switch (action) {
      case 'exportUserData': {
        // Aggregate all personal data for the user
        const results: any = {
          profile: null,
          contributions: [],
          votes: [],
          activity_log: [],
          exported_at: new Date().toISOString(),
          law: 'LGPD (Lei Geral de Proteção de Dados)'
        }

        // 1. Profile
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        results.profile = profile

        // 2. Contributions
        const { data: contributions } = await supabaseClient
          .from('contributions')
          .select('*')
          .eq('user_id', user.id)
        results.contributions = contributions || []

        // 3. Votes
        const { data: votes } = await supabaseClient
          .from('topic_votes')
          .select('*')
          .eq('user_id', user.id)
        results.votes = votes || []

        // 4. Activity Logs (if table exists)
        try {
          const { data: logs } = await supabaseClient
            .from('activity_log')
            .select('*')
            .eq('user_id', user.id)
          results.activity_log = logs || []
        } catch (e) {
          console.error('Error fetching activity_log:', e)
        }
        
        responseData = results
        break
      }

      case 'deleteAccount': {
        const { confirmation } = params
        if (confirmation !== 'DELETE') throw new Error('Confirmation string mismatch')

        // Step 1: Explicit pre-anonimization of records that MUST be preserved for integrity.
        // We do this BEFORE deleting the auth user to avoid race conditions with FK triggers.

        // Nullify topic_votes user references (votes must remain for governance integrity)
        await supabaseAdmin
          .from('topic_votes')
          .update({ user_id: null })
          .eq('user_id', user.id)

        // Nullify activity_log user references (audit trail must remain)
        await supabaseAdmin
          .from('activity_log')
          .update({ user_id: null })
          .eq('user_id', user.id)

        // Anonimize the profile personal data (wallet, contributions etc. cascade via FK ON DELETE SET NULL)
        await supabaseAdmin
          .from('profiles')
          .update({
            full_name: 'Membro Excluído',
            avatar_url: null,
          })
          .eq('id', user.id)

        // Step 2: Delete the auth user — this will cascade-delete the profile row
        // and trigger ON DELETE SET NULL on all remaining FK references.
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        if (deleteError) throw deleteError

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
