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
        
        // Fetch user profile to check roles
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()
          
        const canSeeAll = profile?.role === 'admin' || 
                          profile?.roles?.includes('admin') || 
                          profile?.role === 'transversal_council' ||
                          profile?.roles?.includes('transversal_council')

        // 1. Build query
        let query = supabaseClient
          .from('activities')
          .select(`
            *,
            requester:profiles!requester_id (id, full_name),
            worker:profiles!worker_id (id, full_name),
            confirmations:activity_confirmations (count),
            evidence:activity_evidence (evidence_url),
            attachments:activity_attachments (count)
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

        if (!canSeeAll) {
          query = query.or(`status.neq.pending_approval,requester_id.eq.${user.id}`)
          query = query.or(`status.neq.rejected,requester_id.eq.${user.id}`)
        }

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

      case 'fetchActivityDetail': {
        const { id } = params
        if (!id) throw new Error('Missing activity ID')

        const { data: activity, error } = await supabaseClient
          .from('activities')
          .select(`
            *,
            requester:profiles!requester_id (id, full_name, avatar_url),
            worker:profiles!worker_id (id, full_name, avatar_url),
            confirmations:activity_confirmations (*, profile:profiles(full_name, avatar_url)),
            evidence:activity_evidence (*),
            attachments:activity_attachments (*)
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        
        // Check if user has confirmed this specific activity
        const { data: userConfirm } = await supabaseClient
          .from('activity_confirmations')
          .select('id')
          .eq('activity_id', id)
          .eq('user_id', user.id)
          .maybeSingle()

        responseData = {
          ...activity,
          user_has_confirmed: !!userConfirm
        }
        break
      }

      case 'createActivity': {
        const { 
          title, 
          description, 
          rewardAmount, 
          type = 'task', 
          geoRequired = false,
          urgency = false,
          importance = false,
          attachments = [],
          workerId = null
        } = params
        if (!title || !description) throw new Error('Missing activity title or description')
        
        const amount = Number(rewardAmount)
        if (isNaN(amount) || amount <= 0) throw new Error('Reward amount must be a positive number')

        // Fetch min_confirmations from governance_settings
        const { data: govSettings } = await supabaseClient
          .from('governance_settings')
          .select('min_contribution_confirmations')
          .eq('id', 'current')
          .maybeSingle()
          
        const minConfirmations = govSettings?.min_contribution_confirmations || 3;

        const { data: activityData, error } = await supabaseClient
          .from('activities')
          .insert({ 
            title: typeof title === 'string' ? { pt: title, en: title } : title, 
            description: typeof description === 'string' ? { pt: description, en: description } : description, 
            reward_amount: amount,
            type: type,
            requester_id: user.id,
            status: 'pending_approval',
            geo_required: geoRequired,
            validation_method: 'requester_approval',
            min_confirmations: minConfirmations,
            urgency,
            importance,
            worker_id: workerId
          })
          .select()
          .single()

        if (error) throw error

        // Insert attachments if any
        if (attachments && attachments.length > 0) {
          const attachmentsToInsert = attachments.map((att: any) => ({
            activity_id: activityData.id,
            user_id: user.id,
            file_url: att.file_url,
            file_name: att.file_name,
            file_type: att.file_type,
            file_size: att.file_size,
            is_evidence: false
          }))

          const { error: attError } = await supabaseClient
            .from('activity_attachments')
            .insert(attachmentsToInsert)

          if (attError) throw attError
        }

        responseData = activityData
        break
      }

      case 'submitProof': {
        const { activityId, evidenceUrl, location, attachments = [] } = params
        if (!activityId) throw new Error('Missing activityId')

        // 1. Insert legacy evidence record if evidenceUrl is provided
        if (evidenceUrl) {
          const { error: evidenceError } = await supabaseClient
            .from('activity_evidence')
            .insert({ 
              activity_id: activityId, 
              worker_id: user.id, 
              evidence_url: evidenceUrl,
              location: location
            })

          if (evidenceError) throw evidenceError
        }

        // 2. Insert new attachments if any
        if (attachments && attachments.length > 0) {
          const attachmentsToInsert = attachments.map((att: any) => ({
            activity_id: activityId,
            user_id: user.id,
            file_url: att.file_url,
            file_name: att.file_name,
            file_type: att.file_type,
            file_size: att.file_size,
            is_evidence: true
          }))

          const { error: attError } = await supabaseClient
            .from('activity_attachments')
            .insert(attachmentsToInsert)

          if (attError) throw attError
        }

        // 3. Update activity status
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
        const { data, error } = await supabaseClient.rpc('confirm_activity', {
          p_activity_id: activityId
        })

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
        const { title, description, rewardAmount, evidenceUrl, requesterId, urgency = false, importance = false, attachments = [], workerId = null } = params
        
        const validationMethod = (requesterId && requesterId.trim() !== '') ? 'requester_approval' : 'community_consensus';

        // Use the RPC for complex transaction logic (creating activity + notifications)
        const { data, error } = await supabaseClient.rpc('submit_activity', {
          p_title: title,
          p_description: description,
          p_reward_amount: rewardAmount,
          p_evidence_url: evidenceUrl,
          p_requester_id: requesterId,
          p_validation_method: validationMethod,
          p_urgency: urgency,
          p_importance: importance,
          p_worker_id: workerId
        })

        if (error) throw error

        // Insert attachments if any
        if (attachments && attachments.length > 0) {
          const attachmentsToInsert = attachments.map((att: any) => ({
            activity_id: data, // RPC returns the new ID
            user_id: user.id,
            file_url: att.file_url,
            file_name: att.file_name,
            file_type: att.file_type,
            file_size: att.file_size,
            is_evidence: true // Since it's submitActivity, it's evidence
          }))

          const { error: attError } = await supabaseClient
            .from('activity_attachments')
            .insert(attachmentsToInsert)

          if (attError) throw attError
        }

        responseData = data
        break
      }

      case 'fetchPendingPayouts': {
        // 1. Verify admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'admin' || profile?.roles?.includes('admin')
        if (!isAdmin) throw new Error('Forbidden')

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
          .select('role, roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'admin' || profile?.roles?.includes('admin')
        if (!isAdmin) throw new Error('Forbidden')

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

      case 'fetchInteractions': {
        const { activityId } = params
        if (!activityId) throw new Error('Missing activityId')

        const { data, error } = await supabaseClient
          .from('activity_interactions')
          .select(`
            *,
            user:profiles(id, full_name, avatar_url)
          `)
          .eq('activity_id', activityId)
          .order('created_at', { ascending: true })

        if (error) throw error
        responseData = data
        break
      }

      case 'postInteraction': {
        const { activityId, content, metadata = {} } = params
        if (!activityId || !content) throw new Error('Missing activityId or content')

        const { data, error } = await supabaseClient
          .from('activity_interactions')
          .insert({
            activity_id: activityId,
            user_id: user.id,
            content: content,
            metadata: metadata
          })
          .select(`
            *,
            user:profiles(id, full_name, avatar_url)
          `)
          .single()

        if (error) throw error
        responseData = data
        break
      }

      case 'moderateActivity': {
        const { activityId, action: modAction } = params
        if (!activityId || !modAction) throw new Error('Missing moderation details')
        
        // 1. Verify role
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()
        
        const canModerate = profile?.role === 'admin' || 
                           profile?.roles?.includes('admin') || 
                           profile?.role === 'transversal_council' ||
                           profile?.roles?.includes('transversal_council')
        
        if (!canModerate) throw new Error('Forbidden')

        // 2. Call moderation RPC using admin client
        const { error } = await supabaseAdmin.rpc('moderate_activity', {
          p_activity_id: activityId,
          p_action: modAction
        })

        if (error) throw error

        // 3. Auto-transition to in_progress if approved and has worker_id
        if (modAction === 'approve') {
          const { data: activity } = await supabaseAdmin
            .from('activities')
            .select('worker_id, status')
            .eq('id', activityId)
            .single()

          if (activity && activity.worker_id && activity.status === 'open') {
            await supabaseAdmin
              .from('activities')
              .update({ status: 'in_progress', updated_at: new Date().toISOString() })
              .eq('id', activityId)
          }
        }

        responseData = { success: true }
        break
      }

      case 'deleteActivity': {
        const { activityId, justification } = params
        if (!activityId || !justification) throw new Error('Missing activityId or justification')
        
        // 1. Verify role
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'admin' || profile?.roles?.includes('admin')
        
        if (!isAdmin) throw new Error('Forbidden')

        // 2. Soft delete using admin client
        const { error: updateError } = await supabaseAdmin
          .from('activities')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', activityId)

        if (updateError) throw updateError

        // 3. Log the action
        const { error: logError } = await supabaseAdmin
          .from('audit_logs')
          .insert({
            actor_id: user.id,
            action: 'ADMIN_DELETE_ACTIVITY',
            resource_type: 'activities',
            resource_id: activityId,
            description: {
              pt: `Atividade removida pelo administrador. Justificativa: ${justification}`,
              en: `Activity removed by administrator. Justification: ${justification}`
            },
            metadata: { justification }
          })

        if (logError) throw logError

        responseData = { success: true }
        break
      }

      case 'updateThreshold': {
        const { activityId, threshold } = params
        if (!activityId || threshold === undefined) throw new Error('Missing activityId or threshold')
        
        // 1. Verify role
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, roles')
          .eq('id', user.id)
          .single()
        
        const isAdmin = profile?.role === 'admin' || profile?.roles?.includes('admin')
        if (!isAdmin) throw new Error('Forbidden')

        // 2. Update threshold
        const { error: updateError } = await supabaseAdmin
          .from('activities')
          .update({ min_confirmations: threshold, updated_at: new Date().toISOString() })
          .eq('id', activityId)

        if (updateError) throw updateError

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
