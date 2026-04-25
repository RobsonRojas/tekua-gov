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
      case 'getBalance': {
        const { data, error } = await supabaseClient
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        responseData = data || { balance: 0, locked_balance: 0, pending_audit_balance: 0 }
        break
      }

      case 'fetchTransactions': {
        const { limit = 50 } = params
        const { data, error } = await supabaseClient
          .from('transactions')
          .select('*')
          .eq('wallet_id', user.id) // Assuming wallet_id is user_id for now
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        responseData = data
        break
      }

      case 'transfer': {
        const { to, amount, reason, activityId } = params
        if (!to || amount <= 0) throw new Error('Invalid transfer parameters')

        // 1. Get sender balance
        const { data: senderWallet, error: senderError } = await supabaseClient
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single()
        
        if (senderError) throw senderError
        if (senderWallet.balance < amount) throw new Error('Insufficient balance')

        // 2. Perform atomic transfer using RPC or single function
        // For simplicity in this demo, we'll use a direct update but ideally this should be a DB RPC
        const { data, error } = await supabaseClient.rpc('transfer_surreais', {
          p_from_user: user.id,
          p_to_user: to,
          p_amount: amount,
          p_reason: reason,
          p_activity_id: activityId
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
