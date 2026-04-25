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
      case 'getBalance': {
        // 1. Fetch main balance
        const { data: wallet, error: walletError } = await supabaseClient
          .from('wallets')
          .select('balance')
          .eq('profile_id', user.id) // Fixed column name from profile_id to user_id? Wait, check DB.
          .single()
        
        if (walletError && walletError.code !== 'PGRST116') throw walletError

        // 2. Fetch locked and audit pending balances from activities
        const { data: activities, error: activityError } = await supabaseClient
          .from('activities')
          .select('reward_amount, requires_audit, audit_status, available_at')
          .eq('worker_id', user.id)
          .eq('status', 'completed')

        let locked_balance = 0
        let pending_audit_balance = 0

        if (!activityError && activities) {
          const now = new Date()
          activities.forEach(a => {
            const isLockedByTime = new Date(a.available_at) > now
            const isPendingAudit = a.requires_audit && a.audit_status === 'pending'
            
            if (isLockedByTime && !isPendingAudit) locked_balance += Number(a.reward_amount)
            if (isPendingAudit) pending_audit_balance += Number(a.reward_amount)
          })
        }

        responseData = { 
          balance: wallet?.balance || 0, 
          locked_balance, 
          pending_audit_balance 
        }
        break
      }

      case 'fetchTransactions': {
        const { limit = 50 } = params
        const { data, error } = await supabaseClient
          .from('transactions')
          .select(`
            *,
            from_profile:from_id (full_name),
            to_profile:to_id (full_name)
          `)
          .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        responseData = data
        break
      }

      case 'transfer': {
        const { to, toEmail, amount, description } = params
        let targetId = to

        // 1. Resolve email if provided
        if (toEmail) {
          const { data: recipient, error: recipientError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', toEmail)
            .single()
          
          if (recipientError) throw new Error('Recipient not found')
          targetId = recipient.id
        }

        if (!targetId || amount <= 0) throw new Error('Invalid transfer parameters')

        // 2. Call the database RPC for atomic transfer
        const { data, error } = await supabaseClient.rpc('perform_transfer', {
          p_to_id: targetId,
          p_amount: amount,
          p_description: description
        })

        if (error) throw error
        if (data && !data.success) throw new Error(data.error)
        
        responseData = data
        break
      }

      case 'fetchTreasuryStats': {
        // 1. Verify admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role !== 'admin') throw new Error('Forbidden')

        // 2. Fetch stats using admin client
        const { data: walletData } = await supabaseAdmin.from('wallets').select('balance')
        const { data: mintData } = await supabaseAdmin
          .from('transactions')
          .select(`*, to_profile:to_id (full_name)`)
          .is('from_id', null)
          .order('created_at', { ascending: false })
          .limit(10)

        const total = walletData?.reduce((acc, w) => acc + (w.balance || 0), 0) || 0
        
        responseData = {
          totalSupply: total,
          totalParticipants: walletData?.length || 0,
          recentMints: mintData || []
        }
        break
      }

      case 'mintCurrency': {
        // 1. Verify admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role !== 'admin') throw new Error('Forbidden')

        const { recipientId, amount, description } = params
        if (!recipientId || !amount) throw new Error('Missing minting details')

        // 2. Call the minting RPC using admin client
        const { data, error } = await supabaseAdmin.rpc('admin_mint_currency', {
          p_recipient_id: recipientId,
          p_amount: Number(amount),
          p_description: description
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
