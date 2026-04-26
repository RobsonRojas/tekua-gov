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
      case 'fetchActivities': {
        const { 
          limit = 50, 
          type, 
          status, 
          excludeStatus,
          minAmount,
          maxAmount,
          startDate,
          endDate,
          requesterId,
          workerId
        } = params
        
        // 1. Build query
        let query = supabaseClient
          .from('activities')
          .select(`
            *,
            requester:profiles!requester_id (id, full_name),
            worker:profiles!worker_id (id, full_name),
            confirmations:activity_confirmations (count),
            evidence:activity_evidence (evidence_url)
          `)
        
        if (type && type !== 'all') query = query.eq('type', type)
        if (status && status !== 'all') query = query.eq('status', status)
        if (excludeStatus) query = query.neq('status', excludeStatus)
        if (minAmount !== undefined) query = query.gte('reward_amount', minAmount)
        if (maxAmount !== undefined) query = query.lte('reward_amount', maxAmount)
        if (startDate) query = query.gte('created_at', startDate)
        if (endDate) query = query.lte('created_at', endDate)
        if (requesterId) query = query.eq('requester_id', requesterId)
        if (workerId) query = query.eq('worker_id', workerId)

        const { data: activities, error: activitiesError } = await query
          .order('created_at', { ascending: false })
          .limit(limit)

        if (activitiesError) throw activitiesError

        // 2. Fetch user's confirmations to mark "user_has_confirmed"
        const { data: userConfirms } = await supabaseClient
          .from('activity_confirmations')
          .select('activity_id')
          .eq('user_id', user.id)
        
        const confirmedIds = new Set(userConfirms?.map(c => c.activity_id) || [])

        responseData = activities?.map(item => ({
          ...item,
          user_has_confirmed: confirmedIds.has(item.id)
        })) || []
        break
      }

      case 'createActivity': {
        const { title, description, rewardAmount, type = 'task', geoRequired = false } = params
        if (!title || !description) throw new Error('Missing activity title or description')
        
        const amount = Number(rewardAmount)
        if (isNaN(amount) || amount <= 0) throw new Error('Reward amount must be a positive number')

        const { data, error } = await supabaseClient
          .from('activities')
          .insert({ 
            title: typeof title === 'string' ? { pt: title, en: title } : title, 
            description: typeof description === 'string' ? { pt: description, en: description } : description, 
            reward_amount: amount,
            type: type,
            requester_id: user.id,
            status: 'open',
            geo_required: geoRequired,
            validation_method: 'requester_approval'
          })
          .select()

        if (error) throw error
        responseData = data
        break
      }

      case 'submitProof': {
        const { activityId, evidenceUrl, location } = params
        if (!activityId || !evidenceUrl) throw new Error('Missing proof details')

        // 1. Insert evidence record
        const { error: evidenceError } = await supabaseClient
          .from('activity_evidence')
          .insert({ 
            activity_id: activityId, 
            worker_id: user.id, 
            evidence_url: evidenceUrl,
            location: location
          })

        if (evidenceError) throw evidenceError

        // 2. Update activity status
        const { error: activityError } = await supabaseClient
          .from('activities')
          .update({ status: 'pending_validation', updated_at: new Date().toISOString() })
          .eq('id', activityId)

        if (activityError) throw activityError

        responseData = { success: true }
        break
      }

      case 'confirmActivity': {
        const { activityId } = params
        const { data, error } = await supabaseClient
          .from('activity_confirmations')
          .insert([{ activity_id: activityId, user_id: user.id }])
          .select()

        if (error) throw error
        responseData = data
        break
      }

      case 'claimTask': {
        const { activityId } = params
        if (!activityId) throw new Error('Missing activityId')

        // 1. Check if already claimed or not open
        const { data: activity, error: fetchError } = await supabaseClient
          .from('activities')
          .select('status, requester_id')
          .eq('id', activityId)
          .single()
        
        if (fetchError || !activity) throw new Error('Activity not found')
        if (activity.status !== 'open') throw new Error('Task is no longer open')
        if (activity.requester_id === user.id) throw new Error('You cannot claim your own task')

        // 2. Claim it
        const { data, error } = await supabaseClient
          .from('activities')
          .update({ 
            worker_id: user.id, 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', activityId)
          .eq('status', 'open')
          .select()

        if (error) throw error
        if (!data || data.length === 0) throw new Error('Task was already claimed or is no longer open')
        responseData = data
        break
      }

      case 'submitActivity': {
        const { title, description, rewardAmount, evidenceUrl, requesterId } = params
        
        // Use the RPC for complex transaction logic (creating activity + notifications)
        const { data, error } = await supabaseClient.rpc('submit_activity', {
          p_title: title,
          p_description: description,
          p_reward_amount: rewardAmount,
          p_evidence_url: evidenceUrl,
          p_requester_id: requesterId
        })

        if (error) throw error
        responseData = data
        break
      }

      case 'fetchPendingPayouts': {
        // 1. Verify admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role !== 'admin') throw new Error('Forbidden')

        // 2. Fetch pending audits
        const { data, error } = await supabaseAdmin
          .from('activities')
          .select('*, profiles:worker_id(full_name, email)')
          .eq('requires_audit', true)
          .eq('audit_status', 'pending')
          .order('created_at', { ascending: true })

        if (error) throw error
        responseData = data
        break
      }

      case 'auditPayout': {
        // 1. Verify admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role !== 'admin') throw new Error('Forbidden')

        const { activityId, status } = params
        if (!activityId || !status) throw new Error('Missing audit details')

        // 2. Call the approve_payout RPC using admin client
        const { data, error } = await supabaseAdmin.rpc('approve_payout', {
          p_activity_id: activityId,
          p_status: status
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
